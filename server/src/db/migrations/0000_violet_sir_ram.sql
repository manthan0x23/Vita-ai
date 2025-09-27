CREATE TYPE "public"."task_action_enum" AS ENUM('pending', 'dismiss', 'complete', 'ignore');--> statement-breakpoint
CREATE TYPE "public"."tasks_category_enum" AS ENUM('hydration', 'movement', 'sleep', 'screen', 'mood');--> statement-breakpoint
CREATE TYPE "public"."tasks_time_gate_enum" AS ENUM('morning', 'evening', 'afternoon', 'anytime');--> statement-breakpoint
CREATE TYPE "public"."unit_enum" AS ENUM('ml', 'steps', 'hours', 'minutes', 'mood');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"email" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"category" "tasks_category_enum" NOT NULL,
	"impact_weight" integer NOT NULL,
	"effort_min" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"timegate" "tasks_time_gate_enum" DEFAULT 'anytime' NOT NULL,
	"reward" integer,
	"is_main" boolean DEFAULT true,
	"alternative_task" varchar,
	"micro_task" varchar,
	CONSTRAINT "tasks_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "system_state" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"last_refresh" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"task_id" varchar(50) NOT NULL,
	"action" "task_action_enum" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"goal_type" "tasks_category_enum" NOT NULL,
	"target_value" integer NOT NULL,
	"unit" "unit_enum" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "goal_user_idx_composite_unique_key" UNIQUE("user_id","goal_type")
);
--> statement-breakpoint
CREATE TABLE "user_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date" date NOT NULL,
	"goal_type" varchar(50) NOT NULL,
	"value" integer NOT NULL,
	"unit" "unit_enum" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"task_id" varchar(256) NOT NULL,
	"ignores" integer DEFAULT 0 NOT NULL,
	"status" "task_action_enum" DEFAULT 'pending' NOT NULL,
	"last_dismissal" timestamp,
	"last_completion" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_metrics" ADD CONSTRAINT "user_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;