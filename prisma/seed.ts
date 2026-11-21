import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const catalog: Record<
  string,
  { title: string; author: string; isbn: string; totalCopies: number; publishedYear: number }[]
> = {
  Fiction: [
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', totalCopies: 5, publishedYear: 1960 },
    { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '978-0385474542', totalCopies: 4, publishedYear: 1958 },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', totalCopies: 3, publishedYear: 1925 },
    { title: 'Petals of Blood', author: "Ngũgĩ wa Thiong'o", isbn: '978-0143039174', totalCopies: 4, publishedYear: 1977 },
  ],
  'Science Fiction': [
    { title: 'Dune', author: 'Frank Herbert', isbn: '978-0441172719', totalCopies: 6, publishedYear: 1965 },
    { title: 'Neuromancer', author: 'William Gibson', isbn: '978-0441569595', totalCopies: 3, publishedYear: 1984 },
    { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '978-0441478125', totalCopies: 4, publishedYear: 1969 },
    { title: 'Foundation', author: 'Isaac Asimov', isbn: '978-0553293357', totalCopies: 5, publishedYear: 1951 },
  ],
  Mystery: [
    { title: 'And Then There Were None', author: 'Agatha Christie', isbn: '978-0062073488', totalCopies: 4, publishedYear: 1939 },
    { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '978-0307949486', totalCopies: 3, publishedYear: 2005 },
    { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '978-0307588371', totalCopies: 4, publishedYear: 2012 },
    { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', isbn: '978-1505255607', totalCopies: 5, publishedYear: 1902 },
  ],
  'Non-Fiction': [
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0062316097', totalCopies: 7, publishedYear: 2011 },
    { title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', totalCopies: 8, publishedYear: 2018 },
    { title: 'Educated', author: 'Tara Westover', isbn: '978-0399590504', totalCopies: 4, publishedYear: 2018 },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', totalCopies: 3, publishedYear: 1988 },
  ],
};

async function main() {
  // Wipe old data (children first, parents last)
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for default seeded users: "password123"
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed default librarian and patron accounts
  await prisma.user.createMany({
    data: [
      {
        email: 'librarian@example.com',
        name: 'Lina Librarian',
        password: hashedPassword,
        role: Role.LIBRARIAN,
      },
      {
        email: 'patron@example.com',
        name: 'Paul Patron',
        password: hashedPassword,
        role: Role.PATRON,
      },
    ],
  });

  // Seed genres and books with nested writes
  for (const [genreName, books] of Object.entries(catalog)) {
    await prisma.genre.create({
      data: {
        name: genreName,
        books: { create: books },
      },
    });
  }

  console.log('Seeded 2 users, 4 genres, and 16 books (with ISBNs and hashed passwords)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
