import Layout from "@/components/layout/Layout";
import { useParams } from "react-router-dom";

const SharedList = () => {
  const { listId } = useParams();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Shared List</h1>
        <p className="text-muted-foreground">List ID: {listId}</p>
        <p className="mt-8">This feature is coming soon! You will be able to share your reading lists with friends.</p>
      </div>
    </Layout>
  );
};

export default SharedList;
