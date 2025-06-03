import connect from "@/lib/db";
import { Client } from "@/lib/models/Client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest | Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await connect();
    if (!id) {
      const clientData = await Client.find();

      if (clientData.length < 0 || !clientData) {
        return NextResponse.json(
          {
            message: "client data not found",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ clientData }, { status: 200 });
    }

    const clientData = await Client.findById(id);

    if (!clientData) {
      return NextResponse.json({ message: `client not found with ${id}` });
    }
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
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest | Request) => {
  const data = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...allowedData } = data;

  try {
    await connect();
    const clientData = await Client.create(allowedData);

    if (!clientData) {
      return NextResponse.json(
        {
          message: "client not created",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ clientData }, { status: 200 });
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
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest | Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await connect();
    const clientData = await Client.findByIdAndDelete(id);

    if (!clientData) {
      return NextResponse.json(
        {
          message: "client not found",
        },
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      { message: "client deleted", data: clientData },
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
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest | Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const data = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...allowedData } = data;

  try {
    await connect();
    const clientData = await Client.findByIdAndUpdate(id, allowedData);

    if (!clientData) {
      return NextResponse.json(
        {
          message: "client not found",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ clientData }, { status: 200 });
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
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
