import React, { useState, useEffect } from "react";

const ReferralsPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await fetch("/api/referrals");
        const data = await response.json();
        setReferrals(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching referrals:", error);
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const filteredReferrals = referrals.filter(
    (referral) =>
      referral.referrer_username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referred_username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/referrals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedReferral = await response.json();
        setReferrals(
          referrals.map((r) =>
            r.referral_id === id ? updatedReferral.referral : r
          )
        );
      }
    } catch (error) {
      console.error("Error updating referral status:", error);
    }
  };

  return (
    <div
      className="bg-black p-6 rounded-lg font-inter"
      style={{ border: "1px solid rgba(255,255,255,0.3)" }}
    >
      <h2 className="text-2xl font-bold text-white mb-4">
        Referrals Management
      </h2>
      <p className="text-gray-300 mb-6">
        Track customer referrals and manage referral bonuses.
      </p>

      <div
        className="mt-6 rounded-lg overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.3)" }}
      >
        <div
          className="p-4 bg-black"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.3)" }}
        >
          <h3 className="text-lg font-semibold text-white">Referral List</h3>
          <input
            type="text"
            placeholder="Search referrals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-3 block w-full md:w-1/2 p-2 rounded-md bg-black text-white placeholder-gray-400 focus:outline-none"
            style={{ border: "1px solid rgba(255,255,255,0.3)" }}
          />
        </div>

        {loading ? (
          <div className="p-4 text-white">Loading...</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-black">
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Referrer
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Referred User
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Code
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Bonus
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black">
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((referral) => (
                  <tr
                    key={referral.referral_id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white"
                      style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                    >
                      {referral.referrer_username}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                      style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                    >
                      {referral.referred_username}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                      style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                    >
                      {referral.referral_code}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-white"
                      style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                    >
                      {referral.status}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                      style={{ borderRight: "1px solid rgba(255,255,255,0.3)" }}
                    >
                      ${referral.referral_bonus_amount || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <select
                        value={referral.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            referral.referral_id,
                            e.target.value
                          )
                        }
                        className="bg-black text-white rounded-md px-3 py-1 focus:outline-none"
                        style={{ border: "1px solid rgba(255,255,255,0.3)" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-300"
                  >
                    No referrals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReferralsPage;
