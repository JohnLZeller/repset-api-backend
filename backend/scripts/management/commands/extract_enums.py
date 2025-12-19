"""
Django management command to extract enum values from model fields.

This script introspects Django models to find all fields with choices= definitions
(including ArrayField base fields) and outputs them as JSON for use by Snaplet.

Usage:
    python manage.py extract_enums --output snaplet/.snaplet/enums.json
"""
import json
import sys
from pathlib import Path
from typing import Any

from django.apps import apps
from django.contrib.postgres.fields import ArrayField
from django.core.management.base import BaseCommand, CommandError
from django.db import models


class Command(BaseCommand):
    help = "Extract enum values from Django model fields with choices"

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            type=str,
            default="snaplet/.snaplet/enums.json",
            help="Output path for enums JSON file",
        )
        parser.add_argument(
            "--fail-on-missing",
            action="store_true",
            help="Fail if expected enum fields are not found",
        )

    def handle(self, *args, **options):
        output_path = Path(options["output"])
        fail_on_missing = options["fail_on_missing"]

        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)

        enums: dict[str, dict[str, Any]] = {}

        # Track discovered fields for validation
        discovered_fields: set[str] = set()

        # Iterate through all installed Django models
        for model in apps.get_models():
            model_name = model._meta.label_lower  # e.g., 'catalog.equipment'
            db_table = model._meta.db_table  # e.g., 'catalog_equipment'

            # Iterate through all fields on the model
            for field in model._meta.get_fields():
                if not isinstance(field, models.Field):
                    continue

                field_name = field.name
                full_field_path = f"{db_table}.{field_name}"

                # Check for scalar enum field (CharField with choices)
                if hasattr(field, "choices") and field.choices:
                    # Extract enum values
                    enum_values = self._extract_choices(field.choices)
                    if enum_values:
                        enums[full_field_path] = {
                            "type": "scalar",
                            "values": enum_values,
                            "nullable": field.null if hasattr(field, "null") else False,
                            "model": model_name,
                            "field": field_name,
                        }
                        discovered_fields.add(full_field_path)
                        self.stdout.write(
                            f"Found scalar enum: {full_field_path} -> {len(enum_values)} values"
                        )

                # Check for ArrayField with choices in base_field
                if isinstance(field, ArrayField):
                    base_field = field.base_field
                    if hasattr(base_field, "choices") and base_field.choices:
                        enum_values = self._extract_choices(base_field.choices)
                        if enum_values:
                            enums[full_field_path] = {
                                "type": "array",
                                "values": enum_values,
                                "nullable": field.null if hasattr(field, "null") else False,
                                "model": model_name,
                                "field": field_name,
                            }
                            discovered_fields.add(full_field_path)
                            self.stdout.write(
                                f"Found array enum: {full_field_path} -> {len(enum_values)} values"
                            )

        if not enums:
            raise CommandError("No enum fields found. Check that models have choices= defined.")

        # Write output
        output_data = {
            "enums": enums,
            "discovered_fields": sorted(discovered_fields),
            "total_fields": len(discovered_fields),
        }

        with output_path.open("w") as f:
            json.dump(output_data, f, indent=2, sort_keys=True)

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully extracted {len(enums)} enum fields to {output_path}"
            )
        )

        # Validate expected fields if requested
        if fail_on_missing:
            expected_fields = {
                "catalog_equipment.modality",
                "catalog_equipment.station",
                "catalog_equipment.equipment_type",
                "training_workout.status",
                "catalog_exercise.primary_muscles",
                "catalog_exercise.secondary_muscles",
                "catalog_exercise.attributes",
                "account_usertrainingpreferences.excluded_equipment_modalities",
                "account_usertrainingpreferences.excluded_equipment_stations",
                "account_usertrainingpreferences.excluded_equipment_types",
                "account_usertrainingpreferences.excluded_exercise_attributes",
            }

            missing = expected_fields - discovered_fields
            if missing:
                self.stdout.write(
                    self.style.ERROR(
                        f"Missing expected enum fields: {', '.join(sorted(missing))}"
                    )
                )
                sys.exit(1)

    def _extract_choices(self, choices) -> list[str]:
        """
        Extract enum values from Django choices.

        Handles both:
        - TextChoices enum classes: [(value, label), ...]
        - Plain tuples: [(value, label), ...]
        """
        values = []

        # If choices is a callable (like TextChoices.choices), call it
        if callable(choices):
            choices = choices()

        for choice in choices:
            if isinstance(choice, (list, tuple)) and len(choice) >= 1:
                # Extract the first element (the value)
                value = choice[0]
                # Handle nested tuples (some Django patterns)
                if isinstance(value, (list, tuple)) and len(value) >= 1:
                    value = value[0]
                values.append(str(value))
            elif isinstance(choice, str):
                # Direct string value
                values.append(choice)

        return sorted(set(values))  # Remove duplicates and sort
