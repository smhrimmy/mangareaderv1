import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecret } from "@/hooks/useSecret";
import Layout from "@/components/layout/Layout";
import MangaGrid from "@/components/manga/MangaGrid";
import { useMangaList } from "@/hooks/useManga";
import { Loader2, Lock, Flame, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Vault = () => {
  const { isUnlocked, lock } = useSecret();
  const navigate = useNavigate();
  const [source, setSource] = useState("mangadex"); // "mangadex" or "nhentai"

  useEffect(() => {
    if (!isUnlocked) {
      navigate("/");
    }
  }, [isUnlocked, navigate]);

  // Fetch NSFW content based on source
  const { data: nsfwData, isLoading: isNsfwLoading } = useMangaList({
    limit: 18,
    includeNsfw: true,
    sort: { followedCount: "desc" },
    source: source
  });

  const vaultManga = nsfwData?.pages.flat() || [];

  if (!isUnlocked) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-900/20 rounded-xl text-red-500">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-red-500">The Vault</h1>
              <p className="text-muted-foreground">Secure & Hidden Content</p>
            </div>
          </div>
          <Button variant="destructive" onClick={() => {
            lock();
            navigate("/");
          }}>
            Lock Vault
          </Button>
        </div>

        <Tabs defaultValue="mangadex" onValueChange={setSource} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
            <TabsTrigger value="mangadex" className="flex gap-2">
              <Library className="h-4 w-4" />
              Restricted (MangaDex)
            </TabsTrigger>
            <TabsTrigger value="nhentai" className="flex gap-2">
              <Flame className="h-4 w-4" />
              Doujinshi (nhentai)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mangadex" className="mt-0">
            {isNsfwLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-red-500" />
              </div>
            ) : (
              <MangaGrid 
                manga={vaultManga} 
                title="MangaDex NSFW Collection" 
              />
            )}
          </TabsContent>

          <TabsContent value="nhentai" className="mt-0">
            {isNsfwLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-red-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-sm text-red-500">
                  ⚠️ <strong>Disclaimer:</strong> This content comes from unofficial sources (nhentai). 
                  Requires a working proxy. Content may be subject to availability and region blocks.
                </div>
                <MangaGrid 
                  manga={vaultManga} 
                  title="nhentai Gallery" 
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Vault;
