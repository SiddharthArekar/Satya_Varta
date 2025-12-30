import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Component as NotFoundComponent } from "@/components/ui/404-page-not-found";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return <NotFoundComponent />;
};

export default NotFound;
