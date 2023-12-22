# ZapZap

ZapZap is a study project that I developed to learn about real-time communication in web applications. Built with Next.js, this project serves as a practical example of integrating modern technologies to create a chat application.

## Learning through Practice

This project provided a valuable opportunity to enhance my skills in:

- **Real-Time Communication:** Implementing instant messaging.
- **User Authentication:** Creating secure login and registration systems.
- **Responsive Design:** Adapting the application for different devices.

## Technologies Used

-   **[Next.js](https://nextjs.org/)** A React framework for production.
-   **[Prisma](https://www.prisma.io/)** Next-generation ORM for Node.js and TypeScript.
-   **[TRPC](https://trpc.io/)** End-to-end typesafe APIs made easy.
-   **[Tailwind CSS](https://tailwindcss.com/)** A utility-first CSS framework for rapid UI development.


## Getting Started

To get started, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/NeguinDev/zapzap.git
```
2. Install dependencies

```bash
npm install
```

### Database Configuration

This project uses Prisma with a PostgreSQL database. To set up the database:

#### Database Setup with Docker

This project includes a pre-configured `docker-compose.yml` file to facilitate the setup of the PostgreSQL database. To start the database, follow this simple step:

- **Start the Database with Docker Compose:** In the root directory of the project, run the following command:
```bash
docker-compose up -d
```
This command will start a PostgreSQL instance in a Docker container. Ensure Docker is installed and running on your system before executing this command.

- Configure the `.env` file in the project root with your database connection string:
```bash
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/zapzap"
```

3. Run the Prisma migrations:
```bash
npx prisma migrate dev
```

### Running the Project

4. Start the development server:

```bash
npm run dev
```
