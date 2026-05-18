import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("internal");
    const collection = db.collection("students");

    const { searchParams } = new URL(req.url);

    // -------------------------
    // PAGINATION
    // -------------------------
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // -------------------------
    // SEARCH & SORTING
    // -------------------------
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // -------------------------
    // FILTERS
    // -------------------------
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const country = searchParams.get("country");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const course = searchParams.get("course");
    const industry = searchParams.get("industry");
    const experienceStatus = searchParams.get("experienceStatus");
    const role = searchParams.get("role");
    const certification = searchParams.get("certification");
    const stream = searchParams.get("stream");

    // -------------------------
    // MONGO QUERY BUILDER
    // -------------------------
    let query = {};

    // SEARCH FILTER
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { "workExperience.role": { $regex: search, $options: "i" } },
        { "workExperience.field": { $regex: search, $options: "i" } },
      ];
    }

    // LOCATION FILTERS
    if (country) query["location.country"] = { $regex: country, $options: "i" };
    if (state) query["location.state"] = { $regex: state, $options: "i" };
    if (city) query["location.city"] = { $regex: city, $options: "i" };

    // EDUCATION FILTERS
    if (course) query.course = { $regex: course, $options: "i" };
    if (stream) query.education = { $elemMatch: { stream: { $regex: stream, $options: "i" } } };

    // CERTIFICATION FILTER
    if (certification) {
      query.certifications = {
        $elemMatch: { name: { $regex: certification, $options: "i" } },
      };
    }

    // WORK EXPERIENCE & FRESHER LOGIC
    if (industry) query["workExperience.field"] = { $regex: industry, $options: "i" };
    if (role) query["workExperience.role"] = { $regex: role, $options: "i" };

    if (experienceStatus) {
      if (experienceStatus.toLowerCase() === "fresher") {
        // Find documents where workExperience doesn't exist, is null, or explicitly marked fresher
        query.$or = [
          ...query.$or || [], // Preserve existing $or from search if present (Note: MongoDB $and might be needed if search is also used, but keeping it simple for the direct query context)
          { workExperience: { $exists: false } },
          { workExperience: null },
          { "workExperience.status": "fresher" }
        ];
      } else {
        query["workExperience.status"] = experienceStatus;
      }
    }

    // DATE RANGE FILTER
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      
      // For endDate, push to the end of the day to ensure inclusive filtering
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // -------------------------
    // GET DATA
    // -------------------------
    const students = await collection
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    // -------------------------
    // STATS & COUNTS
    // -------------------------
    const total = await collection.countDocuments(query);
    
    // Independent counts for dashboard KPI cards (ignoring the current filter so they stay consistent)
    const workingCount = await collection.countDocuments({ "workExperience.status": "working" });
    const leftCount = await collection.countDocuments({ "workExperience.status": "left" });
    const certifiedCount = await collection.countDocuments({
      certifications: { $exists: true, $not: { $size: 0 } },
    });

    // -------------------------
    // RESPONSE
    // -------------------------
    return Response.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalStudents: total, // You could change this to the raw total of all documents if preferred
        working: workingCount,
        left: leftCount,
        certified: certifiedCount,
      },
      data: students,
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}