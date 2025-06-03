import { Agency } from "@/lib/models/Agency";
import connect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest | Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await connect();

    if (!id) {
      const AgencyData = await Agency.find();

      if (AgencyData.length < 0 || !AgencyData) {
        return NextResponse.json(
          { message: "no agency found" },
          { status: 400 }
        );
      }

      return NextResponse.json({ AgencyData }, { status: 200 });
    }

    const AgencyData = await Agency.findById(id);
    if (!AgencyData) {
      return NextResponse.json(
        {
          message: "agency not found",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ AgencyData }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest | Request) => {
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...allowedData } = body;

  try {
    await connect();
    const newAgency = await Agency.create(allowedData);

    if (!newAgency) {
      return NextResponse.json(
        {
          message: "agency not created",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ newAgency }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "internal Server Error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest | Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "id must needed" }, { status: 404 });
  }

  try {
    await connect();

    const deleteAgency = await Agency.findByIdAndDelete(id);

    if (!deleteAgency) {
      return NextResponse.json(
        { message: "agency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "agency deleted", data: deleteAgency },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest | Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {
        message: "id must required",
      },
      { status: 400 }
    );
  }

  try {
    await connect();
    const body = await req.json();
    const updateAgency = await Agency.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updateAgency) {
      return NextResponse.json(
        { message: "agency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "agency updated", data: updateAgency },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
};
