from django.contrib import admin

from catalog.models import Equipment, Exercise


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    """Admin interface for Equipment model."""

    list_display = [
        "name",
        "brand",
        "modality",
        "station",
        "equipment_type",
        "created_at",
    ]
    list_filter = ["brand", "modality", "station", "equipment_type", "created_at"]
    search_fields = ["name", "brand"]


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    """Admin interface for Exercise model."""

    list_display = ["name", "created_at"]
    list_filter = ["attributes", "created_at"]
    search_fields = ["name", "description"]
    filter_horizontal = []
