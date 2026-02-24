import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { PHP_BASE_URL } from "../config/api";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import {
  FileText,
  Trash2,
  Calendar,
  User,
  Search,
  Clock,
  ArrowRight,
  Shield,
  Layout,
  Mail,
  FileCheck,
  Zap,
  Download
} from "lucide-react";
import { toast } from "react-toastify";

const MyDocs = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [user, setUser] = useState(auth.currentUser);
  const triggerPHPPrint = async (doc) => {
    setSelectedDoc(doc);
    const endpoint = doc.type === 'email' ? 'email-generator.php' : 'application-generator.php';

    try {
      const response = await axios.post(`${PHP_BASE_URL}${endpoint}`, doc.formData, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.type}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("PDF Generation failed:", error);
      toast.error("Failed to generate PDF via PHP. Make sure your PHP server is running.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchDocs(currentUser);
      } else {
        setDocs([]);
        setLoading(false);
      }
    });

    const fetchDocs = async (currentUser) => {
      try {
        const q = query(
          collection(db, "userDocuments"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        docsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || 0;
          const dateB = b.createdAt?.toDate() || 0;
          return dateB - dateA;
        });

        setDocs(docsData);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to fetch documents");
      }
      setLoading(false);
    };

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDoc(doc(db, "userDocuments", id));
        setDocs(docs.filter(doc => doc.id !== id));
        toast.success("Document deleted successfully");
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document");
      }
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || doc.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl max-w-md w-full">
          <Shield className="w-16 h-16 mx-auto mb-6 text-purple-400 opacity-50" />
          <h2 className="text-2xl font-bold mb-4">Access Protected</h2>
          <p className="text-gray-400 mb-8">Please log in to view and manage your documents.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 -translate-x-[200px] bg-purple-500 rounded-full mix-blend-multiply opacity-5 filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply opacity-5 filter blur-xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              My Documents
            </h1>
            <p className="text-gray-400">All your AI-generated documents in one place.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all w-full sm:w-64"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Types</option>
              <option value="email" className="bg-slate-900">Emails</option>
              <option value="application" className="bg-slate-900">Applications</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
            <FileText className="w-20 h-20 mx-auto mb-6 text-gray-500 opacity-20" />
            <h3 className="text-2xl font-semibold mb-2 text-gray-300">No documents found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {searchTerm || filter !== 'all'
                ? "We couldn't find any documents matching your criteria."
                : "Generate your first document using our AI-powered generators!"}
            </p>
            {!searchTerm && filter === 'all' && (
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/email-generator" className="flex items-center space-x-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-6 py-3 rounded-xl transition-all group">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <span>Email Generator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="/application-generator" className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-6 py-3 rounded-xl transition-all group">
                  <FileCheck className="w-5 h-5 text-cyan-400" />
                  <span>Application Generator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${doc.type === 'email' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {doc.type === 'email' ? <Mail className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-2 text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                  {doc.title || "Untitled Document"}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {doc.createdAt?.toDate().toLocaleDateString('en-GB') || 'Unknown Date'}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    {doc.createdAt?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || ''}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Layout className="w-4 h-4 mr-2" />
                    {doc.type === 'email' ? 'Email' : 'Application'}
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-xl mb-4">
                  <p className="text-xs text-purple-400 font-semibold mb-1 flex items-center">
                    <Zap className="w-3 h-3 mr-1" /> Prompt
                  </p>
                  <p className="text-sm text-gray-300 line-clamp-2 italic">
                    {doc.prompt || "No prompt saved..."}
                  </p>
                </div>

                <button
                  onClick={() => triggerPHPPrint(doc)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/10 py-3 rounded-xl hover:from-purple-500/30 hover:to-cyan-500/30 transition-all group/btn"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold">Generate PDF Again</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default MyDocs;
