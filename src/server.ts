import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma, PrismaClient } from "@prisma/client";
import { fox } from "@prisma/client";
import cors from '@fastify/cors';
import { request } from 'http';

const prisma = new PrismaClient();
const app = Fastify();
app.register(cors, {
    origin: "*",
});

app.post('/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, name, age, description, vaccinated } = request.body as fox;
    const fox = await prisma.fox.create({
        data: {
            id,
            name,
            age,
            description,
            vaccinated
        },
    });
    reply.send('Fox created')
});


app.get('/foxes', async (request: FastifyRequest, reply: FastifyReply) => {
    const foxes = await prisma.fox.findMany();
    reply.send(foxes)
})

app.get('/foxes/search', async (request: FastifyRequest, reply: FastifyReply) => {
    const { query } = request.query as { query: string };
    try {
        const foxes = await prisma.fox.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
        });
        reply.send(foxes);
    } catch (error) {
        console.error('Something went wrong:', error);
    }
});

app.put('/foxes/:name', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name } = request.params as { name: string };
    const foxData = request.body as Prisma.foxUpdateInput;;

    try {
        const updatedFox = await prisma.fox.updateMany({
            where: { name: name },
            data: foxData, 
        });

        reply.send('fox updated!')
    } catch (error) {
        console.error('Something went wrong:', error);
    }
});

app.delete('/foxes/:name', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name } = request.params as { name: string };

    try {
        const deletedFoxes = await prisma.fox.deleteMany({
            where: { name: name },
        });

        reply.send('Foxes deleted.')

    } catch (error) {
        console.error('Something went wrong:', error);
    }
});

const start = async () => {
    try {
        await app.listen({ port: 3333 });
        console.log('Server listening at http://localhost:3333');
    } catch (error) {
        console.error('Something went wrong.');
        process.exit(1);
    }
};

start();