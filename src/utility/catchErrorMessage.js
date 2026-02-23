const catchErrorMessage = (err) => {

  // *** Firebase Auth / Firestore error *** //
  if (err?.code) {
    return err.code
      .replace("auth/", "")
      .replace("firestore/", "")
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());
  }


  // *** API / Axios / Backend error *** //
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }


  // *** Normal JS error *** //
  if (err?.message) {
    return err.message;
  }


  // *** String error *** //
  if (typeof err === "string") {
    return err;
  }


  // *** Fallback *** //
  return "Something went wrong. Please try again.";
};


export default catchErrorMessage;