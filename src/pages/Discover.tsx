import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { genres } from "@/lib/data";

const Discover = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Discover by Genre</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <Link key={genre} to={`/browse?genre=${genre}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-lg font-semibold">{genre}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
