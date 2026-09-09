import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

const parseId = (value: string): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const validateBook = (
  body: Record<string, unknown>,
  partial = false
): string | null => {
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      return "Title is required";
    }
  }

  if (!partial || body.author !== undefined) {
    if (typeof body.author !== "string" || body.author.trim() === "") {
      return "Author is required";
    }
  }

  if (!partial || body.isbn !== undefined) {
    if (typeof body.isbn !== "string" || body.isbn.trim() === "") {
      return "ISBN is required";
    }
  }

  if (!partial || body.price !== undefined) {
    if (
      typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price <= 0
    ) {
      return "Price must be a positive number";
    }
  }

  if (body.inStock !== undefined && typeof body.inStock !== "boolean") {
    return "inStock must be a boolean";
  }

  return null;
};

const handlePrismaError = (error: unknown, res: Response) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return res.status(409).json({ error: "A book with this ISBN already exists" });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    const author =
      typeof req.query.author === "string" ? req.query.author.trim() : "";

    const books = await prisma.book.findMany({
      where: author
        ? { author: { contains: author } }
        : undefined,
      orderBy: { id: "asc" },
    });

    return res.json(books);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

export const getBookById = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid book id" });

  try {
    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.json(book);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

export const createBook = async (req: Request, res: Response) => {
  const errorMessage = validateBook(req.body);
  if (errorMessage) {
    return res.status(400).json({ error: errorMessage });
  }

  const { title, author, isbn, price, inStock } = req.body;

  try {
    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        price,
        inStock: inStock ?? true,
      },
    });

    return res.status(201).json(book);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid book id" });

  const errorMessage = validateBook(req.body, true);
  if (errorMessage) {
    return res.status(400).json({ error: errorMessage });
  }

  const { title, author, isbn, price, inStock } = req.body;

  const data: {
    title?: string;
    author?: string;
    isbn?: string;
    price?: number;
    inStock?: boolean;
  } = {};

  if (title !== undefined) data.title = title.trim();
  if (author !== undefined) data.author = author.trim();
  if (isbn !== undefined) data.isbn = isbn.trim();
  if (price !== undefined) data.price = price;
  if (inStock !== undefined) data.inStock = inStock;

  try {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }

    const book = await prisma.book.update({
      where: { id },
      data,
    });

    return res.json(book);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid book id" });

  try {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }

    await prisma.book.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
