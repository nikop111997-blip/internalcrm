import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      mobile,
      course,
      location,
      education,
      certifications,
      workExperience,
    } = body;

    // Validation
    if (!firstName || !email || !mobile) {
      return Response.json(
        {
          success: false,
          message: "Required fields are missing",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db("internal");

    const collection = db.collection("students");

    // Check duplicate email
    const existingEmail = await collection.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return Response.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 }
      );
    }

    // Check duplicate mobile
    const existingMobile = await collection.findOne({
      mobile,
    });

    if (existingMobile) {
      return Response.json(
        {
          success: false,
          message: "Mobile number already exists",
        },
        { status: 409 }
      );
    }

    // Create document
    const studentData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      mobile,
      course,

      location,

      education,

      certifications,

      workExperience,

      createdAt: new Date(),
    };

    // Insert into DB
    const result = await collection.insertOne(studentData);

    return Response.json({
      success: true,
      message: "Application submitted successfully",
      insertedId: result.insertedId,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}