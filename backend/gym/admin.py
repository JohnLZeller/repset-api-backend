from django.contrib import admin

from gym.models import Gym, GymEquipment


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    """Admin interface for Gym model."""

    list_display = ["name", "city", "state_province", "country", "created_at"]
    list_filter = ["country", "state_province", "created_at"]
    search_fields = ["name", "city", "street_address"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(GymEquipment)
class GymEquipmentAdmin(admin.ModelAdmin):
    """Admin interface for GymEquipment model."""

    list_display = ["gym", "equipment", "equipment_display_number"]
    list_filter = ["gym", "equipment__brand", "equipment__equipment_type"]
    search_fields = ["gym__name", "equipment__name", "equipment_display_number"]
    raw_id_fields = ["gym", "equipment"]
