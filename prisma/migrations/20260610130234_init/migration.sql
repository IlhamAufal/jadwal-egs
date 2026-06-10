-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "class_code" VARCHAR(10) NOT NULL,
    "class_name" VARCHAR(10) NOT NULL,
    "subject_code" VARCHAR(10) NOT NULL,
    "teacher_nik" VARCHAR(20) NOT NULL,
    "teacher_name" VARCHAR(100) NOT NULL,
    "date" DATE NOT NULL,
    "jam_ke" INTEGER NOT NULL,
    "time_start" TIME NOT NULL,
    "time_end" TIME NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);
