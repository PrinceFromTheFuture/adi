import { NextRequest, NextResponse } from "next/server";
import { listEntity, filterEntity, createEntity, bulkCreateEntity, updateEntity, deleteEntity, EntityName } from "@/lib/db-operations";

const validEntities = [
  "User",
  "FoodItem",
  "SavedMeal",
  "Meal",
  "FoodDatabase",
  "WaterLog",
  "StepsLog",
  "WeightLog",
  "RestDay",
  "DailyReminder",
  "Workout",
  "WorkoutSession",
];

function isValidEntity(entity: string): entity is EntityName {
  return validEntities.includes(entity);
}

// GET - List or filter entities
export async function GET(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const { entity } = await params;

    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Invalid entity: ${entity}` }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get("sortBy") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const filterParam = searchParams.get("filter");

    let results;
    if (filterParam) {
      const filterQuery = JSON.parse(filterParam);
      results = await filterEntity(entity, filterQuery, sortBy, limit);
    } else {
      results = await listEntity(entity, sortBy, limit);
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error("GET entity error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Create entity or bulk create
export async function POST(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const { entity } = await params;

    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Invalid entity: ${entity}` }, { status: 400 });
    }

    const body = await request.json();

    let result;
    if (Array.isArray(body)) {
      result = await bulkCreateEntity(entity, body);
    } else {
      result = await createEntity(entity, body);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error("POST entity error:", error);
    // Log the full error with cause
    if (error instanceof Error && "cause" in error) {
      console.error("Error cause:", error.cause);
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const cause = error instanceof Error && "cause" in error ? (error as any).cause : null;
    return NextResponse.json(
      {
        error: message,
        details: cause ? cause.message || String(cause) : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT - Update entity
export async function PUT(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const { entity } = await params;

    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Invalid entity: ${entity}` }, { status: 400 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 });
    }

    const result = await updateEntity(entity, id, data);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("PUT entity error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Delete entity
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const { entity } = await params;

    if (!isValidEntity(entity)) {
      return NextResponse.json({ error: `Invalid entity: ${entity}` }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required for delete" }, { status: 400 });
    }

    await deleteEntity(entity, id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE entity error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
