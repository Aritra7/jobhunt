import { useEffect, useState } from "react";
import { fetchJobs } from "../services/jobService";

// Loads the job list from the (mock) job service.
export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchJobs().then((data) => {
      if (!active) return;
      setJobs(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { jobs, loading };
}
