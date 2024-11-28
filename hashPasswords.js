const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const hashPasswords = async () => {
  try {
    const doctors = await prisma.doctor.findMany();
    for (const doctor of doctors) {
      if (!doctor.password.startsWith('$2b$')) { // 既にハッシュ化されているか確認
        const hashedPassword = await bcrypt.hash(doctor.password, 10);
        await prisma.doctor.update({
          where: { docid: doctor.docid },
          data: { password: hashedPassword },
        });
      }
    }
    console.log('Passwords hashed successfully');
  } catch (err) {
    console.error('Error hashing passwords:', err);
  } finally {
    await prisma.$disconnect();
  }
};

hashPasswords();