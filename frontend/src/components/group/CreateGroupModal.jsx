import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { API_BASE_URL } from "../../api/config";

const CreateGroupModal = ({ isOpen, onClose, refreshGroups }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupIcon, setGroupIcon] = useState(null);
    const [searchTerm, setSearchTerm] = useState("")
    const [preview, setPreview] = useState(null);

    const token = localStorage.getItem("token")
    useEffect(() => {
        if (isOpen) {
            fetchContacts(searchTerm)
        }
    }, [isOpen, searchTerm])
    const fetchContacts = async (search = "") => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/getAllContacts?search=${search}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setContacts(res.data.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName || selectedUsers.length === 0) return alert("Fill all details");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("groupName", groupName);
            formData.append("groupIcon", groupIcon); 
            formData.append("participants", JSON.stringify(selectedUsers));

            await axios.post(`${API_BASE_URL}/groups/create-group`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            refreshGroups();
            onClose();
            setGroupName("");
            setSelectedUsers([]);
        } catch (error) {
            alert(error.response?.data?.message || "Error creating group");
        } finally {
            setLoading(false);
        }
    };
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
                <div className="bg-[#075E54] p-4 flex justify-between items-center text-white">
                    <h2 className="font-semibold text-lg">New Group</h2>
                    <IoClose className="cursor-pointer" onClick={onClose} size={24} />
                </div>

                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Group Name"
                        className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#075E54] mb-4"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    <div>
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full bg-gray-100 rounded-full p-2 outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <p className="text-sm text-gray-500 mb-2">Select Participants ({selectedUsers.length})</p>
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                        {contacts.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => toggleUser(user._id)}
                                className={`flex items-center gap-3 p-3 cursor-pointer border-b last:border-0 hover:bg-gray-50 ${selectedUsers.includes(user._id) ? "bg-green-50" : ""
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-[#075E54] flex items-center justify-center text-white">
                                    {user.profilePic ? <img src={user.profilePic} className="rounded-full h-full w-full object-cover" /> : user.fullName[0]}
                                </div>
                                <div className="flex-1 text-sm font-medium">{user.fullName}</div>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user._id)}
                                    readOnly
                                    className="accent-[#075E54]"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end">
                    <button
                        disabled={loading}
                        onClick={handleCreateGroup}
                        className="bg-[#25D366] text-white px-6 py-2 rounded-md font-medium hover:bg-[#128C7E] disabled:bg-gray-400 transition"
                    >
                        {loading ? "Creating..." : "Create Group"}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default CreateGroupModal;