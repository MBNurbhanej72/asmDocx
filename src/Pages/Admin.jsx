import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Shield,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldOff,
  ShieldPlus,
  Mail,
  MessageSquare,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


import { db } from "../config/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Admin({ user, userRole }) {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("isAdmin");
  const [sortOrder, setSortOrder] = useState("desc");
  const [userChangedSort, setUserChangedSort] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    totalContacts: 0,
  });


  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactSortBy, setContactSortBy] = useState("");
  const [contactSortOrder, setContactSortOrder] = useState("asc");
  const [contactCurrentPage, setContactCurrentPage] = useState(1);
  const [contactsPerPage] = useState(10);
  const [selectedContacts, setSelectedContacts] = useState([]);



  document.title = "asmDocx | Admin Dashboard";



  // Load Users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          // Exclude superAdmin from the list entirely so nobody can mess with them
          if (userData.role !== 'superAdmin') {
            fetchedUsers.push({ id: doc.id, ...userData });
          }
        });

        // Map Firestore data to Admin table format
        const formattedUsers = fetchedUsers.map(u => ({
          id: u.id,
          username: u.displayName || (u.email ? u.email.split('@')[0] : "Unknown"), // Use displayName or email prefix
          email: u.email,
          role: u.role || "user",
          status: u.status || "inactive", // Default status to inactive
          joinDate: u.createdAt || new Date().toISOString(),
          lastLogin: u.lastLogin || new Date().toISOString(),
          isAdmin: u.role === "admin"
        }));

        setUsers(formattedUsers);
        setStats({
          totalUsers: formattedUsers.length,
          activeUsers: formattedUsers.filter(u => u.status === "active").length,
          adminUsers: formattedUsers.filter(u => u.role === "admin").length,
        });

      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);



  // Load Contacts from Firestore
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "contacts"));
        const fetchedContacts = [];
        querySnapshot.forEach((doc) => {
          fetchedContacts.push({ id: doc.id, ...doc.data() });
        });

        // Format dates
        const formattedContacts = fetchedContacts.map(c => ({
          ...c,
          created_at: c.createdAt ? new Date(c.createdAt.seconds * 1000).toISOString() : new Date().toISOString()
        }));

        setContacts(formattedContacts);
        setFilteredContacts(formattedContacts);

        // Update stats with total contacts
        setStats(prev => ({
          ...prev,
          totalContacts: formattedContacts.length
        }));

      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []);







  // Filter And Search Users
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      // Double check to ensure we never show superAdmin even if filter logic slips
      const isNotSuperAdmin = user.role !== 'superAdmin';

      return matchesSearch && matchesRole && matchesStatus && isNotSuperAdmin;
    });

    if (sortBy === "isAdmin") {
      // Sort admins first, then by username A–Z
      filtered.sort((a, b) => {
        if (a.isAdmin !== b.isAdmin) {
          return Number(b.isAdmin) - Number(a.isAdmin); // Admins on top
        }
        return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
      });
    } else if (sortBy) {
      // Sort by other field
      filtered.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === "created_at" || sortBy === "last_login" || sortBy === "last_logout") {
          aValue = aValue ? new Date(aValue.replace(" ", "T")) : new Date(0);
          bValue = bValue ? new Date(bValue.replace(" ", "T")) : new Date(0);
        } else {
          aValue = aValue?.toString().toLowerCase() || "";
          bValue = bValue?.toString().toLowerCase() || "";
        }

        return sortOrder === "asc"
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      });
    } else {
      // Default: Admins on top, no secondary sort
      filtered.sort((a, b) => Number(b.isAdmin) - Number(a.isAdmin));
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchQuery, roleFilter, statusFilter, sortBy, sortOrder]);



  // Users Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);


  // Users Sorting
  const handleSort = (field) => {
    setUserChangedSort(true); // mark that user changed sort
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };



  // Select Users 
  function handleSelectUser(userId) {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user.id));
    }
  };



  // Delete Single User
  const handleDeleteUser = async (id) => {
    const targetUser = users.find(u => u.id === id);

    if (user && user.uid === id) {
      toast.warning("You cannot delete your own account.");
      return;
    }

    // Protection: Only superAdmin can delete an admin
    if (targetUser && targetUser.role === 'admin' && userRole !== 'superAdmin') {
      toast.error("Only Super Admin can delete other admins.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((user) => user.id !== id));

      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        // We'd arguably need to check if they were active/admin to fully update stats accurately without refetching,
        // but simple decrement of total is a good start. Refetching or partial updates is better.
        // For simplicity let's just decrement total.
      }));

      toast.success("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };



  // Delete Multi Users
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    if (user && selectedUsers.includes(user.uid)) {
      toast.warning("You cannot delete yourself. Please deselect your account.");
      return;
    }

    // Protection: Identify if any selected user is authentication admin
    const selectedUserObjects = users.filter(u => selectedUsers.includes(u.id));
    const hasAdmin = selectedUserObjects.some(u => u.role === 'admin');

    if (hasAdmin && userRole !== 'superAdmin') {
      toast.error("You cannot bulk delete admins. Only Super Admin can do that.");
      return;
    }

    if (!window.confirm(`Delete ${selectedUsers.length} selected users?`)) return;

    try {
      await Promise.all(selectedUsers.map(id => deleteDoc(doc(db, "users", id))));

      setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)));

      // Update stats roughly
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - selectedUsers.length
      }));

      setSelectedUsers([]);
      toast.success("Selected users deleted successfully.");
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete selected users.");
    }
  };



  // Making Admin To Users
  // Making Admin To Users
  const handleToggleAdmin = async (action, targetUser) => {
    let confirmMessage = "";

    // Check if the current logged-in user is a superAdmin (passed as prop 'user' but we actually need the role from Firestore or use the fact that they are on this page)
    // Ideally we should pass the current admin's role to this component. 
    // For now assuming if they are here, they are at least admin. If they are 'superAdmin', they can make others admin.

    if (action === "toggleAdmin") {
      if (user && user.uid === targetUser.id) {
        toast.warning("You cannot remove your own admin rights.");
        return;
      }

      // Protection: Only superAdmin can demote an admin
      if (targetUser.role === 'admin' && userRole !== 'superAdmin') {
        toast.error("Only Super Admin can demote other admins.");
        return;
      }

      const newRole = targetUser.role === "admin" ? "user" : "admin";
      confirmMessage = targetUser.role === "admin"
        ? `Are you sure you want to remove admin rights from ${targetUser.username}?`
        : `Are you sure you want to make ${targetUser.username} an admin?`;

      if (!window.confirm(confirmMessage)) return;

      try {
        const userRef = doc(db, "users", targetUser.id);
        await updateDoc(userRef, {
          role: newRole
        });

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === targetUser.id ? { ...u, role: newRole } : u
          )
        );

        // Update stats
        if (newRole === "admin") {
          setStats(prev => ({ ...prev, adminUsers: prev.adminUsers + 1 }));
        } else {
          setStats(prev => ({ ...prev, adminUsers: prev.adminUsers - 1 }));
        }

        toast.success(`User role updated to ${newRole}.`);

      } catch (error) {
        console.error("Error updating role:", error);
        toast.error("Failed to update user role.");
      }
    }
  };



  // Filter And Search Contacts
  useEffect(() => {
    let filtered = contacts.filter((c) => {
      const query = contactSearchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(query) ||
        c.message.toLowerCase().includes(query)
      );
    });

    if (contactSortBy) {
      filtered.sort((a, b) => {
        const aVal = (a[contactSortBy] ?? "").toString().toLowerCase();
        const bVal = (b[contactSortBy] ?? "").toString().toLowerCase();

        return contactSortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    } else {
      // Default: sort by created_at DESC (latest first)
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredContacts(filtered);
    setContactCurrentPage(1);
  }, [contacts, contactSearchQuery, contactSortBy, contactSortOrder]);



  // Contacts Pagination
  const indexOfLastContact = contactCurrentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalContactPages = Math.ceil(filteredContacts.length / contactsPerPage);



  // Contacts Sorting
  const handleSortContact = (field) => {

    if (!field) return;

    if (contactSortBy === field) {
      setContactSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setContactSortBy(field);
      setContactSortOrder("asc");
    }
  };



  // Select Contacts
  const handleSelectContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === currentContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(currentContacts.map((contact) => contact.id));
    }
  };



  // Delete Single Contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      await deleteDoc(doc(db, "contacts", id));
      setContacts((prev) => prev.filter((contact) => contact.id !== id));

      // Update total contacts stats
      setStats(prev => ({
        ...prev,
        totalContacts: prev.totalContacts - 1
      }));

      toast.success("Contact deleted successfully.");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact.");
    }
  };



  // Delete Multi Contacts
  const handleBulkDeleteContacts = async () => {
    if (selectedContacts.length === 0) return;

    if (!window.confirm(`Delete ${selectedContacts.length} selected contacts?`)) return;

    try {
      // Delete all selected contacts from Firestore
      await Promise.all(selectedContacts.map(id => deleteDoc(doc(db, "contacts", id))));

      setContacts((prev) => prev.filter((contact) => !selectedContacts.includes(contact.id)));

      // Update total contacts stats
      setStats(prev => ({
        ...prev,
        totalContacts: prev.totalContacts - selectedContacts.length
      }));

      setSelectedContacts([]);
      toast.success("Selected contacts deleted successfully.");
    } catch (error) {
      console.error("Error deleting contacts:", error);
      toast.error("Failed to delete selected contacts.");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 -translate-x-[200px] bg-purple-500 rounded-full mix-blend-multiply opacity-5 filter blur-xl animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-5"></div>
          <div
            className="absolute bottom-2/4 left-1/2 w-96 h-96 translate-y-[150px] bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-5"></div>
        </div>
      </div>



      {/* Navigation */}
      <Navbar user={user} />



      {/* Users */}
      <div className="relative z-10 px-6 py-8 mt-[80px] mb-[50px]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col text-center lg:flex-row lg:items-center lg:justify-center mb-16">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors mb-4">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Manage users, roles, and permissions across your asmDocx platform
              </p>
            </div>
          </div>



          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all duration-300 text-center relative overflow-hidden">
              <div className="flex items-center justify-center mb-4">
                <div className={`bg-blue-500/20 p-4 rounded-full`}>
                  <div className="text-blue-400"><Users className="w-6 h-6" /></div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{stats.totalUsers}</h2>
                <p className="text-gray-300 text-md font-black">Total Users</p>
              </div>

              <div className="absolute top-0 left-0 w-36 h-36 -translate-x-20 translate-y-4 bg-purple-500 rounded-full opacity-40"></div>
              <div className="absolute top-0 right-0 w-36 h-36 translate-x-20 translate-y-4 bg-purple-500 md:bg-cyan-500 rounded-full opacity-40 transition-colors duration-500"></div>
            </div>

            <div
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all duration-300 text-center relative overflow-hidden">
              <div className="flex items-center justify-center mb-4">
                <div className={`bg-purple-500/20 p-4 rounded-full`}>
                  <div className="text-purple-400"><Shield className="w-6 h-6" /></div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{stats.adminUsers}</h2>
                <p className="text-gray-300 text-md font-black">Admin Users</p>
              </div>

              <div className="absolute top-0 left-0 w-36 h-36 -translate-x-20 translate-y-4 bg-cyan-500 rounded-full opacity-40"></div>
              <div className="absolute top-0 right-0 w-36 h-36 translate-x-20 translate-y-4 bg-cyan-500 md:bg-purple-500 rounded-full opacity-40 transition-colors duration-500"></div>
            </div>

            <div
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all duration-300 text-center relative overflow-hidden">
              <div className="flex items-center justify-center mb-4">
                <div className={`bg-green-400/20 p-4 rounded-full`}>
                  <div className="text-green-400"><UserCheck className="w-6 h-6" /></div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{stats.activeUsers}</h2>
                <p className="text-gray-300 text-md font-black">Active Users</p>
              </div>

              <div className="absolute top-0 left-0 w-36 h-36 -translate-x-20 translate-y-4 bg-purple-500 rounded-full opacity-40"></div>
              <div className="absolute top-0 right-0 w-36 h-36 translate-x-20 translate-y-4 bg-purple-500 md:bg-cyan-500 rounded-full opacity-40 transition-colors duration-500"></div>
            </div>

            {/* Total Contacts Card */}
            <div
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all duration-300 text-center relative overflow-hidden">
              <div className="flex items-center justify-center mb-4">
                <div className={`bg-orange-500/20 p-4 rounded-full`}>
                  <div className="text-orange-400"><MessageSquare className="w-6 h-6" /></div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{stats.totalContacts}</h2>
                <p className="text-gray-300 text-md font-black">Total Contacts</p>
              </div>

              <div className="absolute top-0 left-0 w-36 h-36 -translate-x-20 translate-y-4 bg-cyan-500 rounded-full opacity-40"></div>
              <div className="absolute top-0 right-0 w-36 h-36 translate-x-20 translate-y-4 bg-cyan-500 md:bg-purple-500 rounded-full opacity-40 transition-colors duration-500"></div>
            </div>
          </div>



          {/* Filters and Search */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>



              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="all" className="bg-gray-800 text-white py-2 ">All Roles</option>
                  <option value="admin" className="bg-gray-800 text-white py-2 ">Admin</option>
                  <option value="user" className="bg-gray-800 text-white py-2 ">User</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="all" className="bg-gray-800 text-white py-2 hover:bg-purple-600">All Status</option>
                  <option value="active" className="bg-gray-800 text-white py-2 hover:bg-purple-600">Active</option>
                  <option value="inactive" className="bg-gray-800 text-white py-2 hover:bg-purple-600">Inactive</option>
                </select>
              </div>
            </div>
          </div>



          {/* Users Table */}
          <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative ${totalPages > 1 ? "h-[974px]" : "h-auto"}`}>

            {/* Table Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Users ({filteredUsers.length})</h3>
                <button
                  onClick={() => {
                    setSortBy("isAdmin");
                    setSortOrder("desc");
                    setUserChangedSort(false);
                  }}
                  disabled={!userChangedSort}
                  className={`absolute left-36 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl focus:outline-none transition-all ${!userChangedSort ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20"
                    }`}
                >
                  Reset Sort
                </button>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300 text-sm">{selectedUsers.length} selected</span>
                    <button onClick={handleBulkDelete} className="bg-red-500/20 border border-red-500/30 text-red-200 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                  </div>
                )}
              </div>
            </div>



            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-white/20 bg-white/10"
                      />
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>User</span>
                        {sortBy === "username" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Role</span>
                        {sortBy === "role" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Status</span>
                        {sortBy === "status" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("joinDate")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Join Date</span>
                        {sortBy === "joinDate" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-gray-300">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No users found</p>
                          <p className="text-sm mt-2">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="rounded border-white/20 bg-white/10"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="text-white font-medium">{user.username}</div>
                              <div className="text-gray-400 text-sm">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                              ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                              : "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                              }`}
                          >
                            {user.role === "admin" ? (
                              <Shield className="w-3 h-3 mr-1" />
                            ) : (
                              <Users className="w-3 h-3 mr-1" />
                            )}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.status === "active"
                              ? "bg-green-500/20 text-green-200 border border-green-500/30"
                              : user.status === "inactive"
                                ? "bg-gray-500/20 text-gray-200 border border-gray-500/30"
                                : "bg-red-500/20 text-red-200 border border-red-500/30"
                              }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${user.status === "active"
                                ? "bg-green-400"
                                : user.status === "inactive"
                                  ? "bg-gray-400"
                                  : "bg-red-400"
                                }`}
                            ></div>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white">{new Date(user.joinDate).toLocaleDateString()}</div>
                          <div className="text-gray-400 text-sm">
                            Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-5">
                            <button
                              onClick={() => handleToggleAdmin("toggleAdmin", user)}
                              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-lg transition-all duration-300 text-sm"
                              title={user.role === "admin" ? "Remove Admin Rights" : "Make Admin"}
                            >
                              {user.role === "admin" ? (
                                <ShieldOff className="w-4 h-4" />
                              ) : (
                                <ShieldPlus className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 p-2 rounded-lg transition-all duration-300"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>



            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 absolute bottom-0 left-0 right-0">
                <div className="flex items-center justify-between">
                  <div className="text-gray-300 text-sm">
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                    {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-white px-3 py-2 rounded-lg transition-all duration-300"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${currentPage === page
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                          : "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-white px-3 py-2 rounded-lg transition-all duration-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Contacts */}
      <div className="relative z-10 px-6 pt-8 mt-[80px]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col text-center lg:flex-row lg:items-center lg:justify-center mb-16">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Contact Management
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Manage customer inquiries, support requests, and feedback across your asmDocx platform
              </p>
            </div>
          </div>



          {/* Filters and Search */}
          <div className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts or messages..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>



          {/* Contacts Table */}
          <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden mb-[82px] relative ${totalContactPages > 1 ? "h-[974px]" : "h-auto"}`}>
            {/* Table Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Contacts ({filteredContacts.length})</h3>
                <button
                  onClick={() => {
                    setContactSortBy("");
                    setContactSortOrder("");
                  }}
                  disabled={contactSortBy === ""}
                  className={`absolute left-44 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl focus:outline-none transition-all ${contactSortBy === "" ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20"
                    }`}
                >
                  Reset Sort
                </button>
                {selectedContacts.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300 text-sm">{selectedContacts.length} selected</span>
                    <button onClick={handleBulkDeleteContacts} className="bg-red-500/20 border border-red-500/30 text-red-200 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                  </div>
                )}
              </div>
            </div>



            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedContacts.length === currentContacts.length && currentContacts.length > 0}
                        onChange={handleSelectAllContacts}
                        className="rounded border-white/20 bg-white/10"
                      />
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSortContact("name")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Contact</span>
                        {contactSortBy === "name" &&
                          (contactSortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors">
                      <div className="flex items-center space-x-2">
                        <span>Message</span>
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSortContact("created_at")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Submitted</span>
                        {contactSortBy === "created_at" &&
                          (contactSortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-gray-300">Loading contacts...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentContacts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No contacts found</p>
                          <p className="text-sm mt-2">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleSelectContact(contact.id)}
                            className="rounded border-white/20 bg-white/10"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="text-white font-medium">{contact.name}</div>
                              <div className="text-gray-400 text-sm">{contact.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-400 text-sm truncate max-w-xs">{contact.message}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white">{new Date(contact.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 p-2 rounded-lg transition-all duration-300"
                              title="Delete Contact"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>



            {/* Pagination */}
            {totalContactPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 absolute bottom-0 left-0 right-0">
                <div className="flex items-center justify-between">
                  <div className="text-gray-300 text-sm">
                    Showing {indexOfFirstContact + 1} to {Math.min(indexOfLastContact, filteredContacts.length)} of{" "}
                    {filteredContacts.length} contacts
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setContactCurrentPage(Math.max(1, contactCurrentPage - 1))}
                      disabled={contactCurrentPage === 1}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-white px-3 py-2 rounded-lg transition-all duration-300"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalContactPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setContactCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${contactCurrentPage === page
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                          : "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setContactCurrentPage(Math.min(totalContactPages, contactCurrentPage + 1))}
                      disabled={contactCurrentPage === totalContactPages}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-white px-3 py-2 rounded-lg transition-all duration-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />

    </div>
  );
}