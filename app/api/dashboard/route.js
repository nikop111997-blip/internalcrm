// app/api/dashboard/route.js

import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    const db = client.db("internal");

    const collection = db.collection(
      "students"
    );

    // -------------------------
    // DATES
    // -------------------------
    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    // -------------------------
    // TOTAL STUDENTS
    // -------------------------
    const totalStudents =
      await collection.countDocuments();

    // -------------------------
    // NEW THIS MONTH
    // -------------------------
    const newStudents =
      await collection.countDocuments({
        createdAt: {
          $gte: currentMonthStart,
        },
      });

    // -------------------------
    // LEFT / RESIGNED
    // -------------------------
    const resignedStudents =
      await collection.countDocuments({
        "workExperience.status": "left",
      });

    // -------------------------
    // WORKING STUDENTS
    // -------------------------
    const workingStudents =
      await collection.countDocuments({
        "workExperience.status":
          "working",
      });

    // -------------------------
    // CERTIFIED STUDENTS
    // -------------------------
    const certifiedStudents =
      await collection.countDocuments({
        certifications: {
          $exists: true,
          $not: { $size: 0 },
        },
      });

    // -------------------------
    // INDUSTRY BREAKDOWN
    // -------------------------
    const industryStats =
      await collection
        .aggregate([
          {
            $group: {
              _id:
                "$workExperience.field",
              total: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              total: -1,
            },
          },
        ])
        .toArray();

    // -------------------------
    // EMPLOYMENT STATUS
    // -------------------------
    const employmentStatus =
      await collection
        .aggregate([
          {
            $group: {
              _id:
                "$workExperience.status",
              total: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray();

    // -------------------------
    // MONTHLY REGISTRATIONS
    // -------------------------
    const monthlyRegistrations =
      await collection
        .aggregate([
          {
            $group: {
              _id: {
                month: {
                  $month:
                    "$createdAt",
                },
              },
              total: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              "_id.month": 1,
            },
          },
        ])
        .toArray();

    // -------------------------
    // RECENT STUDENTS
    // -------------------------
    const recentStudents =
      await collection
        .find({})
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .toArray();

    // -------------------------
    // TOP STREAMS
    // -------------------------
    const topStreams =
      await collection
        .aggregate([
          {
            $unwind: "$education",
          },
          {
            $group: {
              _id:
                "$education.stream",
              total: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              total: -1,
            },
          },
          {
            $limit: 5,
          },
        ])
        .toArray();

    // -------------------------
    // TOP CERTIFICATIONS
    // -------------------------
    const topCertifications =
      await collection
        .aggregate([
          {
            $unwind:
              "$certifications",
          },
          {
            $group: {
              _id:
                "$certifications.name",
              total: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              total: -1,
            },
          },
          {
            $limit: 5,
          },
        ])
        .toArray();

    // -------------------------
    // LOCATION STATS
    // -------------------------
    const topCities =
      await collection
        .aggregate([
          {
            $group: {
              _id:
                "$location.city",
              total: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              total: -1,
            },
          },
          {
            $limit: 5,
          },
        ])
        .toArray();

    // -------------------------
    // RESPONSE
    // -------------------------
    return Response.json({
      success: true,

      cards: {
        totalStudents,
        newStudents,
        resignedStudents,
        workingStudents,
        certifiedStudents,
      },

      charts: {
        monthlyRegistrations,
        industryStats,
        employmentStatus,
        topStreams,
        topCertifications,
        topCities,
      },

      recentStudents,
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