import Layout from "@/components/layout/Layout";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserProfile = () => {
  const { userId } = useParams();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">ID: {userId}</p>
        </div>
        
        <div className="text-center">
           <p>Public profile view is under construction.</p>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
