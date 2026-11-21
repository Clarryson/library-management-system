# Library Management System API

A progressive backend application built with **NestJS**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. Features full Genre & Book CRUD, dynamic search, multi-factor pagination, bcrypt password hashing, JWT authentication, and role-based authorization (`PATRON` vs `LIBRARIAN`).

---

## 📁 Codebase Architecture & Navigation

The project is structured modularly following standard NestJS architecture:

```text
libra/
├── src/
│   ├── main.ts                       # Application entry point: Global ValidationPipe & CORS
│   ├── app.module.ts                 # Root module importing all feature modules
│   │
│   ├── auth/                         # Authentication & Security Module
│   │   ├── auth.controller.ts        # POST /auth/register, POST /auth/login
│   │   ├── auth.service.ts           # Bcrypt hashing, password validation, JWT signing
│   │   ├── auth.module.ts            # Configures JwtModule and PassportModule
│   │   ├── jwt.strategy.ts           # Passport strategy extracting Bearer JWT tokens
│   │   ├── jwt-auth.guard.ts         # Route guard checking token validity (401 Unauthorized)
│   │   ├── roles.decorator.ts        # @Roles(Role.LIBRARIAN) metadata decorator
│   │   ├── roles.guard.ts            # RBAC guard checking req.user.role (403 Forbidden)
│   │   └── dto/
│   │       ├── register.dto.ts       # Registration validation (strictly defaults to PATRON)
│   │       └── login.dto.ts          # Login credential validation
│   │
│   ├── books/                        # Books Catalog Module
│   │   ├── books.controller.ts       # Public GET /books, protected POST/PATCH/DELETE
│   │   ├── books.service.ts          # Search (title/author), genre filter, skip/take pagination
│   │   ├── books.module.ts           # Feature module definition
│   │   └── dto/
│   │       ├── create-book.dto.ts    # Validates title, author, isbn, totalCopies, genreId
│   │       └── update-book.dto.ts    # Partial updates validation
│   │
│   ├── genres/                       # Genres Module
│   │   ├── genres.controller.ts      # Full Genre CRUD endpoints
│   │   ├── genres.service.ts         # Business logic & uniqueness validation
│   │   ├── genres.module.ts          # Feature module definition
│   │   └── dto/
│   │       ├── create-genre.dto.ts   # Validates genre name
│   │       └── update-genre.dto.ts   # Updates genre name
│   │
│   ├── users/                        # Users Module
│   │   ├── users.controller.ts       # GET /users/profile using @Req()
│   │   └── users.module.ts           # Feature module definition
│   │
│   └── prisma/                       # Database / ORM Layer
│       ├── prisma.service.ts         # Extends PrismaClient and hooks into onModuleInit()
│       └── prisma.module.ts          # @Global() module exporting PrismaService
│
├── prisma/
│   ├── schema.prisma                 # Database models: Role, User, Genre, Book, Review
│   └── seed.ts                       # Seeds 2 users, 4 genres, 16 books with ISBNs & hashes
│
├── docs/
│   └── postman_collection.json       # Complete Postman Collection for all endpoints
│
├── .env.example                      # Environment variables template
└── README.md                         # Project documentation and schema decisions
```

---

## 🚀 API Endpoints Reference

### 1. Authentication (`/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/register` | Public | Register new user (password hashed with bcrypt, role defaults to `PATRON`) |
| `POST` | `/auth/login` | Public | Verify password and issue a 24h JWT Bearer access token |

### 2. User Profile (`/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/users/profile` | Authenticated | Returns the authenticated user's profile (`@Req()`) |

### 3. Genres (`/genres`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/genres` | Public | List all genres |
| `GET` | `/genres/:id` | Public | Retrieve a single genre by ID (including books) |
| `POST` | `/genres` | Public | Create a new genre |
| `PATCH` | `/genres/:id` | Public | Update an existing genre |
| `DELETE`| `/genres/:id` | Public | Delete a genre |

### 4. Books (`/books`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/books` | Public | List books with query parameters: `?search=...`, `?genreId=...`, `?page=...`, `?limit=...` |
| `GET` | `/books/:id` | Public | Retrieve a single book with genre and review details |
| `POST` | `/books` | **LIBRARIAN** | Create a new book (`JwtAuthGuard` + `RolesGuard`) |
| `PATCH` | `/books/:id` | **LIBRARIAN** | Update book details |
| `DELETE`| `/books/:id` | **LIBRARIAN** | Delete a book |

---

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your PostgreSQL credentials and JWT secret:
```bash
cp .env.example .env
```

### 3. Database Migration & Seeding
```bash
# Push schema to PostgreSQL database
npx prisma db push

# Seed initial genres, books, and default accounts
npx prisma db seed
```

**Default Seeded Accounts:**
- **Librarian:** `librarian@example.com` / `password123`
- **Patron:** `patron@example.com` / `password123`

### 4. Running the Application
```bash
# Development mode with hot-reload
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

### 5. Running Tests & Formatting
```bash
# Run unit tests
npm run test

# Format code with Prettier
npm run format
```

---

## 📬 Postman Collection

Import `docs/postman_collection.json` into Postman to instantly test every route:
1. Run **Login as Librarian** or **Login as Patron**. Postman test scripts will automatically set the `{{librarianToken}}` and `{{patronToken}}` collection variables.
2. Execute **Create Book (LIBRARIAN Only)** to verify successful creation with a librarian token.
3. Execute **Forbidden Test: Create Book with Patron Token** to verify that patrons receive `403 Forbidden`.

---

## Schema Decisions

### 1. Normalization: Foreign Key Reference vs. Embedded Genre Information

In our Library Management System, the `Book` model references the `Genre` model through a foreign key (`genreId`) rather than embedding the genre name or details directly inside each book record.

Here is why this relational modeling decision was made:

1. **Elimination of Data Redundancy (Single Source of Truth):**
   - If genre names were stored as plain strings in each book record (e.g., `"Science Fiction"`), the same genre string would be duplicated across hundreds or thousands of books.
   - With a normalized `Genre` table, each genre exists exactly once in the database with its own primary key (`id`).

2. **Preventing Data Anomalies & Inconsistencies:**
   - **Update Anomalies:** If the library decides to rename `"Sci-Fi"` to `"Science Fiction"`, with embedded data we would need to find and update every single book row. If any row is missed, data becomes inconsistent. With a foreign key reference, we update only one record in the `Genre` table, and all associated books instantly reflect the change.
   - **Typo Prevention:** Plain strings allow typos (e.g., `"Sci-fi"`, `"Sci-Fi"`, `"Science Fiction"`), which breaks filtering and searching. A foreign key enforces referential integrity: a book cannot reference a genre ID that does not exist.

3. **Database Performance and Indexing:**
   - Foreign key integers (`genreId: Int`) require much less storage space and are significantly faster to index (`@@index([genreId])`) and compare in SQL queries than variable-length strings.

---

### 2. Relational Modeling (PostgreSQL / Prisma) vs. Document Database Modeling (MongoDB)

| Aspect | Relational Modeling (PostgreSQL / Prisma) | Document Database Modeling (e.g., MongoDB) |
| :--- | :--- | :--- |
| **Data Structure** | Data is strictly divided into normalized tables with fixed schemas, primary keys, and foreign keys. | Data is stored in flexible, JSON-like documents (collections) without strict schemas. |
| **Relationships** | Uses **Foreign Keys** and **Joins** (`@relation` in Prisma) to link records without duplicating data. | Frequently **embeds** sub-documents directly (e.g., an array of genres or reviews directly inside the book document). |
| **Data Integrity** | Enforced at the database engine level via constraints, unique keys, and cascading rules. | Enforced primarily at the application level; documents can have varying shapes. |
| **Updates** | Fast and atomic updates to a single row (e.g., updating a genre name updates it everywhere). | Updating an embedded field across thousands of documents requires updating every document individually. |
| **Reads** | Requires `JOIN` operations (or Prisma `include`) to assemble related data across tables. | Extremely fast for read operations that need the entire document tree in one read without joins. |

In a library catalog where genres, authors, and books have well-defined relationships and strict consistency requirements, relational modeling with PostgreSQL and Prisma provides strong consistency and integrity guarantees.
