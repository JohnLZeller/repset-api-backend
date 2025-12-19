from django.contrib import admin

from catalog.models import Exercise, Machine


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    """Admin interface for Machine model."""

    list_display = ["name", "brand", "equipment_type", "created_at"]
    list_filter = ["brand", "equipment_type", "created_at"]
    search_fields = ["name", "brand"]


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    """Admin interface for Exercise model."""

    list_display = ["name", "created_at"]
    search_fields = ["name", "description"]
    filter_horizontal = []
