import { PrismaClient } from '@prisma/client';
import { toZonedTime } from 'date-fns-tz';

const prisma = new PrismaClient();

const updateTimeZone = async () => {
  try {
    // データベースから全てのスケジュールを取得
    const schedules = await prisma.schedule.findMany();
    console.log('Fetched schedules:', schedules);

    // タイムゾーンを日本標準時（JST）に変換
    const timeZone = 'Asia/Tokyo';
    const updatedSchedules = schedules.map(schedule => {
      const examdateJST = toZonedTime(schedule.examdate, timeZone);
      const examtimeJST = toZonedTime(schedule.examtime, timeZone);
      console.log(`Updating schedule ID ${schedule.id}: ${schedule.examdate} -> ${examdateJST}, ${schedule.examtime} -> ${examtimeJST}`);
      return {
        ...schedule,
        examdate: examdateJST,
        examtime: examtimeJST,
      };
    });

    // データベースを更新
    for (const schedule of updatedSchedules) {
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          examdate: schedule.examdate,
          examtime: schedule.examtime,
        },
      });
    }

    console.log('タイムゾーンの更新が完了しました');
  } catch (error) {
    console.error('タイムゾーンの更新中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
};

updateTimeZone();