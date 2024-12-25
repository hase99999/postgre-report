import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const deleteAllSchedules = async () => {
  try {
    await prisma.schedule.deleteMany({});
    console.log('All schedules have been deleted.');
  } catch (error) {
    console.error('Error deleting schedules:', error);
  } finally {
    await prisma.$disconnect();
  }
};

deleteAllSchedules();