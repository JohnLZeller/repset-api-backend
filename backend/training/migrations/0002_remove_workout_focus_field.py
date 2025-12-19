# Generated manually to remove WorkoutFocus field

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("training", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="workout",
            name="focus",
        ),
    ]
