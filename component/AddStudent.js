"use client";

import BackButton from "@/lib/BackButton";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

// --- CONSTANTS FOR DROPDOWNS ---
const TOP_STREAMS = [
  "B.Tech / B.E. (Engineering)", "M.Tech / M.E.", "BCA (Computer Applications)", "MCA",
  "B.Sc (Science)", "M.Sc", "B.Com (Commerce)", "M.Com", "BBA (Business Admin)", "MBA",
  "BA (Arts)", "MA", "MBBS / Medicine", "Nursing / Pharmacy", "LLB (Law)", "LLM",
  "B.Arch (Architecture)", "B.Des (Design)", "PhD / Doctorate", "Other"
];

const TOP_FIELDS = [
  "Software Development / IT", "Healthcare & Medicine", "Finance & Banking", "Education & E-learning",
  "Retail & E-commerce", "Manufacturing & Production", "Marketing & Advertising", "Sales & Business Dev",
  "Human Resources (HR)", "Operations & Supply Chain", "Management Consulting", "Real Estate & Construction",
  "Telecommunications", "Media & Entertainment", "Automotive", "Hospitality & Tourism",
  "Legal Services", "Non-Profit / NGO", "Government / Public Sector", "Other"
];

export default function StudentInfoForm() {
  // --- LOCATION STATE & API LOGIC ---
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  course: "",
});
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
        const json = await res.json();
        if (!json.error) {
          const sortedCountries = json.data.sort((a, b) => a.name.localeCompare(b.name));
          setCountries(sortedCountries);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountry) {
        setStates([]);
        setSelectedState("");
        return;
      }
      setIsLoadingLocation(true);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry }),
        });
        const json = await res.json();
        if (!json.error) setStates(json.data.states);
        else setStates([]);
      } catch (error) {
        setStates([]);
      } finally {
        setIsLoadingLocation(false);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry || !selectedState) {
        setCities([]);
        setSelectedCity("");
        return;
      }
      setIsLoadingLocation(true);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry, state: selectedState }),
        });
        const json = await res.json();
        if (!json.error) setCities(json.data);
        else setCities([]);
      } catch (error) {
        setCities([]);
      } finally {
        setIsLoadingLocation(false);
      }
    };
    fetchCities();
  }, [selectedCountry, selectedState]);

  // --- FORM STATE ---
  const [educationList, setEducationList] = useState([{ year: "", stream: "" }]);
  const [hasExperience, setHasExperience] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificateList, setCertificateList] = useState([{ name: "" }]);

  const [experience, setExperience] = useState({
    companyName: "",
    role: "",
    field: "",
    timePeriod: "",
    status: "Not Hired",
    description: "",
  });

  // --- HANDLERS ---
  const handleAddEducation = () => setEducationList([...educationList, { year: "", stream: "" }]);

  const handleRemoveEducation = (index) => {
    const updated = [...educationList];
    updated.splice(index, 1);
    setEducationList(updated);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: value };
    setEducationList(updated);
  };

  const handleAddCertificate = () => setCertificateList([...certificateList, { name: "" }]);

  const handleRemoveCertificate = (index) => {
    const updated = [...certificateList];
    updated.splice(index, 1);
    setCertificateList(updated);
  };

  const handleCertificateChange = (index, value) => {
    const updated = [...certificateList];
    updated[index].name = value;
    setCertificateList(updated);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.firstName.trim()) {
    return toast.error("First name is required");
  }

  if (!formData.email.trim()) {
    return toast.error("Email is required");
  }

  try {
    const payload = {
      ...formData,

      location: {
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
      },

      education: educationList,

      certifications: hasCertificate
        ? certificateList
        : [],

      workExperience: hasExperience
        ? experience
        : null,
    };

    const loadingToast = toast.loading(
      "Submitting application..."
    );

    const response = await fetch(
      "/api/student-application",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    toast.dismiss(loadingToast);

    if (!response.ok) {
      throw new Error(
        data.message || "Submission failed"
      );
    }

    toast.success(
      data.message || "Application submitted successfully"
    );

    // Optional Reset
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      course: "",
    });

    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");

    setEducationList([{ year: "", stream: "" }]);

    setCertificateList([{ name: "" }]);

    setExperience({
      companyName: "",
      role: "",
      field: "",
      timePeriod: "",
      status: "Not Hired",
      description: "",
    });

    setHasCertificate(false);
    setHasExperience(false);

  } catch (error) {
    console.error(error);

    toast.error(
      error.message || "Something went wrong"
    );
  }
};
  // Shared inner input classes for highly compact layout
  const inputClass = "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#7F56D9] focus:outline-none focus:ring-1 focus:ring-[#7F56D9]";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";
  const sectionTitleClass = "text-base font-semibold text-gray-900 mb-3 border-b pb-1.5";

  return (
    // Locked viewport height on desktop (lg:h-screen)
    <div className="min-h-screen lg:h-screen w-full py-24 px-12 overflow-hidden dark:bg-white">
        <BackButton />
      <div className=" bg-white flex flex-col mt-6">
        
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 shrink-0">Student Application Form</h2>

        <form  className="flex flex-col flex-1 min-h-0"  onSubmit={handleSubmit}>
          {/* Main 2-column Grid - allows internal scroll ONLY if user dynamically adds tons of extra fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0 lg:overflow-hidden">
            
            {/* --- LEFT COLUMN --- */}
            <div className="flex flex-col gap-6 lg:overflow-y-auto lg:pr-2">
              
              {/* Section 1: Basic Info */}
              <div>
                <h3 className={sectionTitleClass}>Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First name</label>
                    <input
  type="text"
  placeholder="First name"
  value={formData.firstName}
  onChange={(e) =>
    setFormData({
      ...formData,
      firstName: e.target.value,
    })
  }
  className={inputClass}
/>
                  </div>
                  <div>
                    <label className={labelClass}>Last name</label>
                    <input
  type="text"
  placeholder="Last name"
  value={formData.lastName}
  onChange={(e) =>
    setFormData({
      ...formData,
      lastName: e.target.value,
    })
  }
  className={inputClass}
/>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
  type="email"
  placeholder="Email address"
  value={formData.email}
  onChange={(e) =>
    setFormData({
      ...formData,
      email: e.target.value,
    })
  }
  className={inputClass}
/>
                  </div>
                  <div>
                    <label className={labelClass}>Mobile</label>
                    <input
  type="number"
  placeholder="Mobile number"
  value={formData.mobile}
  onChange={(e) =>
    setFormData({
      ...formData,
      mobile: e.target.value,
    })
  }
  className={inputClass}
/>
                  </div>
                  <div>
                    <label className={labelClass}>Course (Enrolled In)</label>
                    <input
  type="text"
  placeholder="Course Name"
  value={formData.course}
  onChange={(e) =>
    setFormData({
      ...formData,
      course: e.target.value,
    })
  }
  className={inputClass}
/>
                  </div>
                </div>
              </div>

              {/* Section 2: Location */}
              <div>
                <h3 className={sectionTitleClass}>Location</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Country</label>
                    <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className={inputClass}>
                      <option value="">Select...</option>
                      {countries.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      State {isLoadingLocation && !selectedState && <span className="text-[10px] text-[#7F56D9]">(Wait)</span>}
                    </label>
                    <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry || states.length === 0} className={`${inputClass} disabled:bg-gray-100`}>
                      <option value="">Select...</option>
                      {states.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      City {isLoadingLocation && selectedState && !selectedCity && <span className="text-[10px] text-[#7F56D9]">(Wait)</span>}
                    </label>
                    <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState || cities.length === 0} className={`${inputClass} disabled:bg-gray-100`}>
                      <option value="">Select...</option>
                      {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 5: Certificates (Moved to Left Col to balance height) */}
              <div>
                <h3 className={sectionTitleClass}>Certifications</h3>
                <label className="flex items-center space-x-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCertificate}
                    onChange={(e) => setHasCertificate(e.target.checked)}
                    className="w-4 h-4 text-[#7F56D9] border-gray-300 rounded focus:ring-[#7F56D9]"
                  />
                  <span className="text-sm font-medium text-gray-700">I have certifications</span>
                </label>

                {hasCertificate && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {certificateList.map((cert, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Certificate Name (e.g. AWS Certified)"
                            value={cert.name}
                            onChange={(e) => handleCertificateChange(index, e.target.value)}
                            className={inputClass}
                          />
                          {certificateList.length > 1 && (
                            <button type="button" onClick={() => handleRemoveCertificate(index)} className="text-xs font-medium text-red-500 hover:text-red-700 whitespace-nowrap">
                              Drop
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddCertificate} className="text-xs font-medium text-[#7F56D9] hover:text-[#6941C6] mt-1">
                      + Add another
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="flex flex-col gap-6 lg:overflow-y-auto lg:pl-2">
              
              {/* Section 3: Education */}
              <div>
                <h3 className={sectionTitleClass}>Education History</h3>
                {educationList.map((edu, index) => (
                  <div key={index} className="mb-3 p-3 border border-gray-100 bg-gray-50 rounded-lg relative group">
                    {educationList.length > 1 && (
                      <button type="button" onClick={() => handleRemoveEducation(index)} className="absolute top-2 right-2 text-xs font-medium text-red-500 hover:text-red-700 z-10">
                        Remove
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Duration (Year)</label>
                        <input
                          type="text"
                          placeholder="e.g. 2020 - 2024"
                          value={edu.year}
                          onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Stream / Degree</label>
                        <select
                          value={edu.stream}
                          onChange={(e) => handleEducationChange(index, "stream", e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select Stream...</option>
                          {TOP_STREAMS.map((stream, i) => (
                            <option key={i} value={stream}>{stream}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddEducation} className="text-xs font-medium text-[#7F56D9] hover:text-[#6941C6]">
                  + Add more education
                </button>
              </div>

              {/* Section 4: Work Experience */}
              <div>
                <h3 className={sectionTitleClass}>Work Experience</h3>
                <label className="flex items-center space-x-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExperience}
                    onChange={(e) => setHasExperience(e.target.checked)}
                    className="w-4 h-4 text-[#7F56D9] border-gray-300 rounded focus:ring-[#7F56D9]"
                  />
                  <span className="text-sm font-medium text-gray-700">I have previous work experience</span>
                </label>

                {hasExperience && (
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelClass}>Role / Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Developer"
                        value={experience.role}
                        onChange={(e) => setExperience({ ...experience, role: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelClass}>Field / Industry</label>
                      <select
                        value={experience.field}
                        onChange={(e) => setExperience({ ...experience, field: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select Industry...</option>
                        {TOP_FIELDS.map((field, i) => (
                          <option key={i} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Year"
                        value={experience.timePeriod}
                        onChange={(e) => setExperience({ ...experience, timePeriod: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
                      <select
                        value={experience.status}
                        onChange={(e) => setExperience({ ...experience, status: e.target.value })}
                        className={inputClass}
                      >
                        <option >Select A Status</option>
                        <option value="working">Working</option>
                        <option value="left">Left</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-5 pt-4 border-t border-gray-200 shrink-0 flex justify-end">
            <button type="submit" className="w-full lg:w-auto bg-[#002c54] text-white rounded-lg px-8 py-2.5 text-sm font-semibold hover:bg-[#03305a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002c54] shadow-sm cursor-pointer">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}