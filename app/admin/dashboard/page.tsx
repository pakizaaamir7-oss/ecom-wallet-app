// app/admin/dashboard/page.tsx (App Router)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";
; // Import jwt to decode on client (for roles check)


interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number; // Expiration time
  iat: number; // Issued at time
}

interface FormData {
  name: string;
  description: string;
  category: string;
  images: File[];
  color: string;
  price: number;
  discountedPrice: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
}
export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "Option 1",
    images: [],
    color: "",
    price: 0,
    discountedPrice: 0,
  });
  const [message, setMessage] = useState<ApiResponse | null>(null);

  /////check for validation for authorized person
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/admin"); // Redirect to login if no token
      return;
    }

    try {
      // Decode the token (client-side decoding is for UI purposes, not security)
      const decoded = jwtDecode<DecodedToken>(token);

      if (
        decoded &&
        decoded.role === "admin" &&
        decoded.exp * 1000 > Date.now()
      ) {
        setIsAdmin(true);
      } else {
        localStorage.removeItem("adminToken"); // Token invalid or expired
        router.push("/admin");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("adminToken");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  if (!isAdmin) {
    return null; // Or a message like "Access Denied" if not redirected
  }

  ////////capturing the data of input fields
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "images") {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 10) {
        alert("You can upload up to 10 images only.");
        (e.target as HTMLInputElement).value = "";
        return;
      }

      //   setFormData({ ...formData, images: files ? Array.from(files) : [] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  // console.log(formData);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("data", data);
      setMessage(data);
      setFormData({
        name: "",
        description: "",
        category: "Option 1",
        images: [],
        color: "",
        price: 0,
        discountedPrice: 0,
      });
    } catch (error) {
      //   console.log(error);
    }
  };

  return (
    <>
    <div className="bg-gray-100 flex items-center justify-center p-6 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Upload Product</h2>

        <input
          id="name"
          type="text"
          name="name"
          placeholder="Product Name"
          className="w-full h-10 p-2 border rounded-lg"
          required
          value={formData.name}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full h-20 p-2 border rounded-lg"
          required
          value={formData.description}
          onChange={handleChange}
        />

        <div>
          <label className="block mb-1">Select the Category</label>
          <select
            name="category"
            className="w-full p-2 border rounded-lg"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="cardholder">Card Holder</option>
            <option value="bifold">Bifold</option>
            <option value="trifold">Trifold</option>
            <option value="longwallet">Long Wallet</option>
          </select>
        </div>

        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          className="w-full p-1 border rounded-lg"
          required
          onChange={handleChange}
        />

        <input
          type="text"
          name="color"
          placeholder="Enter the color"
          className="w-full h-10 p-1 border rounded-lg"
          value={formData.color}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          className="w-full h-10 p-2 border rounded-lg"
          required
          value={formData.price}
          onChange={handleChange}
        />

        <input
          type="number"
          name="discountedPrice"
          placeholder="Discounted Price"
          className="w-full h-10 p-2 border rounded-lg"
          value={formData.discountedPrice}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
        {message ? (
          <p className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded-md shadow-sm text-sm font-medium ">
            {message.message}
          </p>
        ) : (
          <p></p>
        )}
      </form>
      
    </div>
    <div className="flex items-center justify-center  bg-gray-100">
  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
    View Your Products
  </button>
</div>
    </>
  );
}
