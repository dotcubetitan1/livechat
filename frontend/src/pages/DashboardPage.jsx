// import { useEffect, useState } from "react";
// import axios from "axios";
// import { API_BASE_URL } from "../api/config";
// import { useNavigate } from "react-router-dom";
// import { CgProfile } from "react-icons/cg";
// import { IoArrowBackCircleOutline } from "react-icons/io5";

// const DashboardPage = () => {
//   const [activeTab, setActiveTab] = useState("images");
//   const [allMedia, setAllMedia] = useState({ allVideo: [], allImage: [] });
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAllMedia = async () => {
//       try {
//         setLoading(true)
//         const res = await axios.get(`${API_BASE_URL}/getAllMedia`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setAllMedia(res.data);
//       } catch (err) {
//         console.error("Error fetching media:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAllMedia();
//   }, [token]);

//   if (loading) {
//     return <div className="flex justify-center items-center h-full">
//       <div className="w-15 h-15 border-4 border-[#075E54] rounded-full border-t-transparent animate-spin mx-auto "></div>
//     </div>
//   }

//   return (
//     <div className="flex flex-col bg-white h-full">
//       <div className="bg-[#075E54] px-4 py-4 flex items-center gap-3">
//         <button onClick={() => navigate("/chat")} className="md:hidden text-white text-2xl">
//           <IoArrowBackCircleOutline />
//         </button>
//         <h1 className="text-white font-medium flex-1">My Media</h1>
//         <div onClick={() => navigate("/profile")} className="text-white/80 cursor-pointer text-2xl">
//           <CgProfile />

//         </div>
//       </div>

//       <div className="flex border-b border-gray-200 bg-white">
//         {["images", "videos", "documents"].map(tab => (
//           <button key={tab} onClick={() => setActiveTab(tab)}
//             className={`flex-1 py-3 text-sm capitalize transition border-b-2
//             ${activeTab === tab ? "border-[#075E54] text-[#075E54] font-medium" : "border-transparent text-gray-500"}`}>
//             {tab}
//           </button>
//         ))}
//       </div>

//       <div className="flex-1 overflow-auto">
//         {activeTab === "images" && (
//           <div className="grid grid-cols-3 gap-0.5 bg-gray-200">
//             {allMedia.allImage.map((img, i) => (
//               <img key={i} src={img} className="w-full aspect-square object-cover" />
//             ))}
//           </div>
//         )}
//         {activeTab === "videos" && (
//           <div className="grid grid-cols-3 gap-0.5 bg-gray-200">
//             {allMedia.allVideo.map((video, i) => (
//               <video key={i} src={video} className="w-full aspect-square object-cover" />
//             ))}
//           </div>
//         )}
//         {activeTab === "documents" && (
//           <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
//             No documents found
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;