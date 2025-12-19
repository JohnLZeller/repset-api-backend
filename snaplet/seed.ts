import { seed } from "@snaplet/seed";
import { PostgresAdapter } from "@snaplet/seed/adapter-postgres";

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

  const adapter = new PostgresAdapter({ connectionString: databaseUrl });

  try {
    await seed(adapter, async ({ $ }) => {
      // Generate gyms first (needed for users)
      const gyms = await $.gym.gym.createMany({
        count: () => Math.floor(Math.random() * 6) + 5, // 5-10 gyms
        data: {
          name: ({ copycat }) => copycat.companyName(),
          street_address: ({ copycat }) => copycat.streetAddress(),
          street_address_2: ({ copycat }) =>
            Math.random() < 0.3 ? copycat.streetAddress() : "",
          city: ({ copycat }) => copycat.city(),
          state_province: ({ copycat }) => copycat.state(),
          postal_code: ({ copycat }) => copycat.zipCode(),
          country: ({ copycat }) => copycat.country(),
        },
      });

      // Generate equipment catalog (master list)
      const equipment = await $.catalog.equipment.createMany({
        count: () => Math.floor(Math.random() * 51) + 50, // 50-100 items
        data: {
          name: ({ copycat }) => {
            const names = [
              "Power Rack",
              "Smith Machine",
              "Cable Machine",
              "Leg Press",
              "Chest Press",
              "Lat Pulldown",
              "Seated Row",
              "Shoulder Press",
              "Leg Curl",
              "Leg Extension",
              "Calf Raise",
              "Hack Squat",
              "Dip Station",
              "Pull-up Bar",
              "Bench Press",
              "Incline Bench",
              "Decline Bench",
              "Preacher Curl",
              "Tricep Extension",
              "Ab Crunch",
            ];
            return copycat.oneOf(names);
          },
          brand: ({ copycat }) => {
            const brands = [
              "Titan Fitness",
              "Rogue Fitness",
              "Life Fitness",
              "Hammer Strength",
              "Cybex",
              "Precor",
              "Matrix",
              "Technogym",
              "Body-Solid",
              "PowerBlock",
            ];
            return copycat.oneOf(brands);
          },
          // Enum fields are handled by snaplet.config.ts overrides
        },
      });

      // Generate exercises (master catalog)
      const exercises = await $.catalog.exercise.createMany({
        count: () => Math.floor(Math.random() * 101) + 100, // 100-200 exercises
        data: {
          name: ({ copycat }) => {
            const names = [
              "Barbell Bench Press",
              "Dumbbell Flyes",
              "Incline Dumbbell Press",
              "Push-ups",
              "Dips",
              "Pull-ups",
              "Barbell Rows",
              "Lat Pulldowns",
              "Cable Rows",
              "Deadlifts",
              "Squats",
              "Leg Press",
              "Leg Curls",
              "Leg Extensions",
              "Calf Raises",
              "Shoulder Press",
              "Lateral Raises",
              "Front Raises",
              "Bicep Curls",
              "Tricep Extensions",
              "Crunches",
              "Planks",
              "Russian Twists",
              "Mountain Climbers",
            ];
            return copycat.oneOf(names);
          },
          description: ({ copycat }) =>
            Math.random() < 0.7
              ? copycat.sentence({ min: 10, max: 30 })
              : "",
          // Array enum fields (primary_muscles, secondary_muscles, attributes)
          // are handled by snaplet.config.ts overrides
        },
      });

      // Generate gym equipment instances (link gyms to equipment catalog)
      const gymEquipmentList = [];
      for (const gym of gyms) {
        const equipmentCount = Math.floor(Math.random() * 6) + 3; // 3-8 per gym
        const selectedEquipment = equipment
          .sort(() => Math.random() - 0.5)
          .slice(0, equipmentCount);

        for (const eq of selectedEquipment) {
          const instance = await $.gym.gymequipment.create({
            gym_id: gym.id,
            equipment_id: eq.id,
            equipment_display_number: ({ copycat }) =>
              `#${copycat.int({ min: 1, max: 99 })}`,
          });
          gymEquipmentList.push(instance);
        }
      }

      // Generate users (~300)
      const users = await $.account.user.createMany({
        count: 300,
        data: {
          email: ({ copycat }) => copycat.email(),
          full_name: ({ copycat }) => copycat.fullName(),
          gym_id: ({ copycat }) => {
            // 80% of users have a gym
            if (Math.random() < 0.8) {
              return copycat.oneOf(gyms.map((g) => g.id));
            }
            return null;
          },
          is_active: () => Math.random() < 0.95, // 95% active
          is_staff: () => Math.random() < 0.05, // 5% staff
        },
      });

      // Generate training preferences (80% of users)
      const usersWithPreferences = users
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(users.length * 0.8));

      for (const user of usersWithPreferences) {
        await $.account.usertrainingpreferences.create({
          user_id: user.id,
          sessions_per_week: ({ copycat }) =>
            copycat.int({ min: 2, max: 7 }),
          training_intensity: ({ copycat }) =>
            copycat.int({ min: 1, max: 10 }),
          max_session_mins: ({ copycat }) =>
            copycat.int({ min: 30, max: 120 }),
          // Array enum fields (excluded_*) are handled by snaplet.config.ts
        });
      }

      // Generate workouts for each user (5-30 per user)
      const workouts = [];
      for (const user of users) {
        const workoutCount = Math.floor(Math.random() * 26) + 5; // 5-30

        for (let i = 0; i < workoutCount; i++) {
          const status = (() => {
            const rand = Math.random();
            if (rand < 0.3) return "scheduled";
            if (rand < 0.6) return "in_progress";
            return "completed";
          })();

          const workout = await $.training.workout.create({
            user_id: user.id,
            workout_number: i + 1,
            status: status as "scheduled" | "in_progress" | "completed",
            started_at:
              status !== "scheduled"
                ? ({ copycat }) => copycat.dateTime({ daysAgo: 30 })
                : null,
            completed_at:
              status === "completed"
                ? ({ copycat }) => copycat.dateTime({ daysAgo: 1 })
                : null,
          });
          workouts.push(workout);
        }
      }

      // Generate workout exercises (3-6 per workout)
      const workoutExercises = [];
      for (const workout of workouts) {
        const exerciseCount = Math.floor(Math.random() * 4) + 3; // 3-6

        // Get user's gym equipment if they have a gym
        const user = users.find((u) => u.id === workout.user_id);
        const availableEquipment = user?.gym_id
          ? gymEquipmentList.filter((ge) => ge.gym_id === user.gym_id)
          : gymEquipmentList;

        if (availableEquipment.length === 0) continue;

        const selectedExercises = exercises
          .sort(() => Math.random() - 0.5)
          .slice(0, exerciseCount);

        for (let i = 0; i < selectedExercises.length; i++) {
          const selectedEquipment = availableEquipment[
            Math.floor(Math.random() * availableEquipment.length)
          ];

          const workoutExercise = await $.training.workoutexercise.create({
            workout_id: workout.id,
            exercise_id: selectedExercises[i].id,
            gym_equipment_id: selectedEquipment.id,
            order: i,
          });
          workoutExercises.push(workoutExercise);
        }
      }

      // Generate workout sets (3-5 per exercise)
      for (const workoutExercise of workoutExercises) {
        const setCount = Math.floor(Math.random() * 3) + 3; // 3-5 sets

        for (let i = 0; i < setCount; i++) {
          const targetWeight = Math.floor(Math.random() * 200) + 20; // 20-220 lbs
          const targetReps = Math.floor(Math.random() * 12) + 6; // 6-18 reps

          const isCompleted =
            workoutExercise.workout?.status === "completed" &&
            Math.random() < 0.9; // 90% of sets completed in completed workouts

          await $.training.workoutset.create({
            workout_exercise_id: workoutExercise.id,
            set_number: i + 1,
            target_weight_lbs: targetWeight,
            target_reps: targetReps,
            rest_seconds: Math.floor(Math.random() * 120) + 60, // 60-180 seconds
            actual_weight_lbs: isCompleted
              ? targetWeight + Math.floor(Math.random() * 10) - 5 // ±5 lbs variance
              : null,
            actual_reps: isCompleted
              ? targetReps + Math.floor(Math.random() * 4) - 2 // ±2 reps variance
              : null,
            is_completed: isCompleted,
            completed_at: isCompleted
              ? ({ copycat }) => copycat.dateTime({ daysAgo: 1 })
              : null,
          });
        }
      }

      console.log(`Generated ${gyms.length} gyms`);
      console.log(`Generated ${equipment.length} equipment catalog items`);
      console.log(`Generated ${exercises.length} exercises`);
      console.log(`Generated ${gymEquipmentList.length} gym equipment instances`);
      console.log(`Generated ${users.length} users`);
      console.log(`Generated ${usersWithPreferences.length} training preferences`);
      console.log(`Generated ${workouts.length} workouts`);
      console.log(`Generated ${workoutExercises.length} workout exercises`);
      console.log("Demo data generation complete!");
    });
  } catch (error) {
    console.error("Error generating demo data:", error);
    process.exit(1);
  } finally {
    await adapter.close();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
