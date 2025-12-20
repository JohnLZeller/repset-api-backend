import { createSeedClient } from "@snaplet/seed";
import { copycat, faker } from "@snaplet/copycat";
import enumsData from "./.snaplet/enums.json";

/**
 * Seed script for generating demo data.
 *
 * Generates approximately 300 users with realistic related data:
 * - 5-10 gyms
 * - 50-100 equipment catalog items
 * - 100-200 exercises
 * - 3-8 gym equipment instances per gym
 * - 0-1 training preferences per user (80% have preferences)
 * - 5-30 workouts per user
 * - 3-6 exercises per workout
 * - 3-5 sets per exercise
 */

// Type-safe access to enum data
interface EnumField {
  type: "scalar" | "array";
  values: string[];
  nullable: boolean;
  model: string;
  field: string;
}

interface EnumsData {
  enums: Record<string, EnumField>;
  discovered_fields: string[];
  total_fields: number;
}

const enums = (enumsData as EnumsData).enums;

// Helper to pick a random enum value
function pickEnum(fieldPath: string, seed: string): string {
  const enumField = enums[fieldPath];
  if (!enumField) {
    throw new Error(`Enum field not found: ${fieldPath}`);
  }
  return copycat.oneOf(seed, enumField.values);
}

// Helper to pick nullable enum value
function pickEnumNullable(fieldPath: string, seed: string): string | null {
  if (Math.random() < 0.1) return null;
  return pickEnum(fieldPath, seed);
}

// Helper to generate array of enum values (0-3 items)
function pickEnumArray(fieldPath: string, seed: string): string[] {
  const enumField = enums[fieldPath];
  if (!enumField) {
    throw new Error(`Enum field not found: ${fieldPath}`);
  }
  const count = Math.floor(Math.random() * 4); // 0-3 items typical for exclusions
  if (count === 0) return [];
  const shuffled = [...enumField.values].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper to generate array of enum values for muscles (1-4 items)
function pickMuscleArray(fieldPath: string, seed: string): string[] {
  const enumField = enums[fieldPath];
  if (!enumField) {
    throw new Error(`Enum field not found: ${fieldPath}`);
  }
  const count = Math.floor(Math.random() * 4) + 1; // 1-4 items
  const shuffled = [...enumField.values].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function main() {
  // Check DEMO_MODE environment variable
  if (process.env.DEMO_MODE !== "true") {
    console.error("ERROR: DEMO_MODE environment variable is not set to 'true'");
    console.error("This command is only allowed in demo environments.");
    console.error("Set DEMO_MODE=true to proceed.");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Starting demo data generation...");

  try {
    const seed = await createSeedClient();

    // Equipment and exercise name lists
    const equipmentNames = [
      "Power Rack", "Smith Machine", "Cable Machine", "Leg Press",
      "Chest Press", "Lat Pulldown", "Seated Row", "Shoulder Press",
      "Leg Curl", "Leg Extension", "Calf Raise", "Hack Squat",
      "Dip Station", "Pull-up Bar", "Bench Press", "Incline Bench",
      "Decline Bench", "Preacher Curl", "Tricep Extension", "Ab Crunch",
    ];

    const equipmentBrands = [
      "Titan Fitness", "Rogue Fitness", "Life Fitness", "Hammer Strength",
      "Cybex", "Precor", "Matrix", "Technogym", "Body-Solid", "PowerBlock",
    ];

    const exerciseNames = [
      "Barbell Bench Press", "Dumbbell Flyes", "Incline Dumbbell Press",
      "Push-ups", "Dips", "Pull-ups", "Barbell Rows", "Lat Pulldowns",
      "Cable Rows", "Deadlifts", "Squats", "Leg Press", "Leg Curls",
      "Leg Extensions", "Calf Raises", "Shoulder Press", "Lateral Raises",
      "Front Raises", "Bicep Curls", "Tricep Extensions", "Crunches",
      "Planks", "Russian Twists", "Mountain Climbers",
    ];

    const gymNames = [
      "Iron Temple Fitness", "Peak Performance Gym", "Elite Training Center",
      "Power House Gym", "Muscle Factory", "Apex Athletics", "Prime Fitness",
      "Titan Gym", "Victory Fitness", "Alpha Training", "Core Strength Gym",
      "Athletic Edge", "Fitness First", "Strength Lab", "The Gym",
    ];

    const workoutStatuses = enums["training_workout.status"]?.values || ["scheduled", "in_progress", "completed"];

    // Generate gyms first (5-10 gyms)
    const gymCount = Math.floor(Math.random() * 6) + 5;
    const gymResult = await seed.gym_gym((x) =>
      x(gymCount, ({ seed: s }) => ({
        name: copycat.oneOf(s, gymNames),
        street_address: copycat.streetAddress(s),
        street_address_2: Math.random() < 0.3 ? `Suite ${copycat.int(s + "suite", { min: 100, max: 999 })}` : "",
        city: copycat.city(s),
        state_province: copycat.state(s),
        postal_code: `${copycat.int(s + "zip", { min: 10000, max: 99999 })}`,
        country: "United States",
      }))
    );
    const gyms = gymResult.gym_gym;
    console.log(`Generated ${gyms.length} gyms`);

    // Generate equipment catalog (50-100 items)
    const equipmentCount = Math.floor(Math.random() * 51) + 50;
    const equipmentResult = await seed.catalog_equipment((x) =>
      x(equipmentCount, ({ seed: s }) => ({
        name: copycat.oneOf(s, equipmentNames),
        brand: copycat.oneOf(s + "brand", equipmentBrands),
        modality: pickEnum("catalog_equipment.modality", s),
        station: pickEnumNullable("catalog_equipment.station", s + "station"),
        equipment_type: pickEnum("catalog_equipment.equipment_type", s + "type"),
      }))
    );
    const equipment = equipmentResult.catalog_equipment;
    console.log(`Generated ${equipment.length} equipment catalog items`);

    // Generate exercises (100-200 exercises)
    const exerciseCount = Math.floor(Math.random() * 101) + 100;
    const exerciseResult = await seed.catalog_exercise((x) =>
      x(exerciseCount, ({ seed: s }) => ({
        name: copycat.oneOf(s, exerciseNames),
        description: Math.random() < 0.7 ? copycat.sentence(s) : "",
        primary_muscles: pickMuscleArray("catalog_exercise.primary_muscles", s),
        secondary_muscles: pickMuscleArray("catalog_exercise.secondary_muscles", s + "sec"),
        // Use empty array instead of null - Snaplet has issues with null array literals
        attributes: pickEnumArray("catalog_exercise.attributes", s + "attr"),
      }))
    );
    const exercises = exerciseResult.catalog_exercise;
    console.log(`Generated ${exercises.length} exercises`);

    // Generate gym equipment instances (3-8 per gym)
    let gymEquipmentCount = 0;
    for (const gym of gyms) {
      const count = Math.floor(Math.random() * 6) + 3;
      const selectedEquipment = equipment
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      for (let i = 0; i < selectedEquipment.length; i++) {
        await seed.gym_gymequipment([{
          gym_id: gym.id,
          equipment_id: selectedEquipment[i].id,
          equipment_display_number: `#${i + 1}`,
        }]);
        gymEquipmentCount++;
      }
    }
    console.log(`Generated ${gymEquipmentCount} gym equipment instances`);

    // Get all gym equipment for workout exercise generation
    const allGymEquipmentResult = seed.$store;
    const gymEquipmentList = allGymEquipmentResult.gym_gymequipment || [];

    // Generate users (~300)
    const userResult = await seed.account_user((x) =>
      x(300, ({ seed: s }) => ({
        email: copycat.email(s),
        password: "pbkdf2_sha256$720000$demo$hashedpassword", // Django hashed password placeholder
        full_name: copycat.fullName(s),
        gym_id: Math.random() < 0.8 ? copycat.oneOf(s + "gym", gyms.map(g => g.id)) : null,
        is_active: Math.random() < 0.95,
        is_staff: Math.random() < 0.05,
        is_superuser: false,
      }))
    );
    const users = userResult.account_user;
    console.log(`Generated ${users.length} users`);

    // Generate training preferences (80% of users)
    const usersWithPreferences = users
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(users.length * 0.8));

    for (const user of usersWithPreferences) {
      await seed.account_usertrainingpreferences([{
        user_id: user.id,
        sessions_per_week: copycat.int(user.id.toString(), { min: 2, max: 7 }),
        training_intensity: copycat.int(user.id.toString() + "int", { min: 1, max: 10 }),
        max_session_mins: copycat.int(user.id.toString() + "mins", { min: 30, max: 120 }),
        excluded_equipment_modalities: pickEnumArray("account_usertrainingpreferences.excluded_equipment_modalities", user.id.toString()),
        excluded_equipment_stations: pickEnumArray("account_usertrainingpreferences.excluded_equipment_stations", user.id.toString() + "sta"),
        excluded_equipment_types: pickEnumArray("account_usertrainingpreferences.excluded_equipment_types", user.id.toString() + "typ"),
        excluded_exercise_attributes: pickEnumArray("account_usertrainingpreferences.excluded_exercise_attributes", user.id.toString() + "attr"),
      }]);
    }
    console.log(`Generated ${usersWithPreferences.length} training preferences`);

    // Generate workouts (5-30 per user)
    let workoutCount = 0;
    let workoutExerciseCount = 0;
    let setCount = 0;

    for (const user of users) {
      const userWorkoutCount = Math.floor(Math.random() * 26) + 5;
      
      // Get gym equipment for this user's gym
      const userGymEquipment = user.gym_id
        ? gymEquipmentList.filter((ge: any) => ge.gym_id === user.gym_id)
        : gymEquipmentList;

      if (userGymEquipment.length === 0) continue;

      for (let i = 0; i < userWorkoutCount; i++) {
        const status = copycat.oneOf(user.id.toString() + i, workoutStatuses);
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 30);
        const startedAt = status !== "scheduled" ? new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000) : null;
        const completedAt = status === "completed" ? new Date(now.getTime() - (daysAgo - 1) * 24 * 60 * 60 * 1000) : null;

        const workoutResult = await seed.training_workout([{
          user_id: user.id,
          workout_number: i + 1,
          status,
          started_at: startedAt,
          completed_at: completedAt,
        }]);
        workoutCount++;

        const workout = workoutResult.training_workout[0];

        // Generate 3-6 exercises per workout
        const exercisePerWorkout = Math.floor(Math.random() * 4) + 3;
        const selectedExercises = exercises
          .sort(() => Math.random() - 0.5)
          .slice(0, exercisePerWorkout);

        for (let j = 0; j < selectedExercises.length; j++) {
          const selectedEquipment = userGymEquipment[Math.floor(Math.random() * userGymEquipment.length)];

          const workoutExerciseResult = await seed.training_workoutexercise([{
            workout_id: workout.id,
            exercise_id: selectedExercises[j].id,
            gym_equipment_id: selectedEquipment.id,
            order: j,
          }]);
          workoutExerciseCount++;

          const workoutExercise = workoutExerciseResult.training_workoutexercise[0];

          // Generate 3-5 sets per exercise
          const setsPerExercise = Math.floor(Math.random() * 3) + 3;
          for (let k = 0; k < setsPerExercise; k++) {
            const targetWeight = Math.floor(Math.random() * 200) + 20;
            const targetReps = Math.floor(Math.random() * 12) + 6;
            const isCompleted = status === "completed" && Math.random() < 0.9;

            await seed.training_workoutset([{
              workout_exercise_id: workoutExercise.id,
              set_number: k + 1,
              target_weight_lbs: targetWeight,
              target_reps: targetReps,
              rest_seconds: Math.floor(Math.random() * 120) + 60,
              actual_weight_lbs: isCompleted ? targetWeight + Math.floor(Math.random() * 10) - 5 : null,
              actual_reps: isCompleted ? targetReps + Math.floor(Math.random() * 4) - 2 : null,
              is_completed: isCompleted,
              completed_at: isCompleted ? completedAt : null,
            }]);
            setCount++;
          }
        }
      }
    }

    console.log(`Generated ${workoutCount} workouts`);
    console.log(`Generated ${workoutExerciseCount} workout exercises`);
    console.log(`Generated ${setCount} workout sets`);
    console.log("Demo data generation complete!");

    process.exit(0);
  } catch (error) {
    console.error("Error generating demo data:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
