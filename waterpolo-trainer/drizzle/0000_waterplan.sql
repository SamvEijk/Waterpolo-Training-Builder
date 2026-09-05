CREATE TABLE `exercises` (`id` text PRIMARY KEY NOT NULL, `title` text NOT NULL, `category` text NOT NULL, `duration` integer NOT NULL, `players` text, `equipment` text, `goal` text, `description` text NOT NULL, `created_at` text NOT NULL);
CREATE TABLE `trainings` (`id` text PRIMARY KEY NOT NULL, `title` text NOT NULL, `training_date` text, `created_at` text NOT NULL);
CREATE TABLE `training_exercises` (`id` text PRIMARY KEY NOT NULL, `training_id` text NOT NULL REFERENCES trainings(id), `exercise_id` text NOT NULL REFERENCES exercises(id), `position` integer NOT NULL);
CREATE INDEX `idx_exercises_category` ON `exercises` (`category`);
CREATE INDEX `idx_training_exercises_training_position` ON `training_exercises` (`training_id`, `position`);
