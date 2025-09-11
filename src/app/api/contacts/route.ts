import { NextResponse } from "next/server";

type Contact = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  relation?: string;
};

let contacts: Contact[] = [];
let nextId = 1;

export async function GET() {
  try {
    return NextResponse.json(
      { contacts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, relation } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const contact: Contact = {
      id: nextId++,
      name,
      phone,
      email,
      relation,
    };

    contacts.push(contact);
    return NextResponse.json(
      { contact },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    contacts.splice(index, 1);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}