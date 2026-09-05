import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(), title: text('title').notNull(), category: text('category').notNull(), duration: integer('duration').notNull(), players: text('players'), equipment: text('equipment'), goal: text('goal'), description: text('description').notNull(), createdAt: text('created_at').notNull(),
});
export const trainings = sqliteTable('trainings', { id: text('id').primaryKey(), title: text('title').notNull(), trainingDate: text('training_date'), createdAt: text('created_at').notNull() });
export const trainingExercises = sqliteTable('training_exercises', { id: text('id').primaryKey(), trainingId: text('training_id').notNull().references(()=>trainings.id), exerciseId: text('exercise_id').notNull().references(()=>exercises.id), position: integer('position').notNull() });
