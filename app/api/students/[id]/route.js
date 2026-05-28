import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/* =========================================================
   GET SINGLE EMPLOYEE
========================================================= */

export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const {id} = await params
    const db = client.db("internal");

    const employee = await db
      .collection("students")
      .findOne({
        _id: new ObjectId(id),
      });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Employee not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   UPDATE EMPLOYEE
========================================================= */

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { id } = await params
    const client = await clientPromise;

    const db = client.db("internal");

    const updatedEmployee =
      await db
        .collection("students")
        .findOneAndUpdate(
          {
            _id: new ObjectId(
              id
            ),
          },

          {
            $set: {
              firstName:
                body.firstName,

              lastName:
                body.lastName,

              email: body.email,

              mobile:
                body.mobile,

              course:
                body.course,

              location:
                body.location,

              education:
                body.education,

              certifications:
                body.certifications,

              workExperience:
                body.workExperience,
            },
          },

          {
            returnDocument:
              "after",
          }
        );

    return NextResponse.json({
      success: true,
      message:
        "Employee updated successfully",
      employee:
        updatedEmployee,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE EMPLOYEE
========================================================= */

export async function DELETE(
  req,
  { params }
) {
  try {
    const client = await clientPromise;

    const db = client.db("internal");
    const { id } = await params
    await db
      .collection("students")
      .deleteOne({
        _id: new ObjectId(
          id
        ),
      });

    return NextResponse.json({
      success: true,
      message:
        "Employee deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong",
      },
      { status: 500 }
    );
  }
}