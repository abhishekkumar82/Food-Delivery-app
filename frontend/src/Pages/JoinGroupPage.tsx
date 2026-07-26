import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinGroupPage = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const join = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed) navigate(`/group/${trimmed}`);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-10 text-center">
      <Users className="mx-auto text-orange-500" size={40} />
      <h1 className="text-2xl font-bold">Join a group order</h1>
      <p className="text-sm text-gray-500">
        Enter the invite code your friend shared to add your items to their cart.
      </p>
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="e.g. A1B2C3"
        className="text-center text-xl tracking-widest"
        onKeyDown={(e) => e.key === "Enter" && join()}
      />
      <Button className="bg-orange-500" onClick={join}>
        Join group
      </Button>
    </div>
  );
};

export default JoinGroupPage;
