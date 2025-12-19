from django.contrib import admin

from gym.models import Gym, GymMachine


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    """Admin interface for Gym model."""

    list_display = ["name", "city", "state_province", "country", "created_at"]
    list_filter = ["country", "state_province", "created_at"]
    search_fields = ["name", "city", "street_address"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(GymMachine)
class GymMachineAdmin(admin.ModelAdmin):
    """Admin interface for GymMachine model."""

    list_display = ["gym", "master_machine", "machine_number"]
    list_filter = ["gym", "master_machine__brand", "master_machine__equipment_type"]
    search_fields = ["gym__name", "master_machine__name", "machine_number"]
    raw_id_fields = ["gym", "master_machine"]
