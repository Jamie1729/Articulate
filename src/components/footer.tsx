import { Link } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { GithubIcon, LinkedInIcon } from "@/components/icons";
import { FolderGit2, BookOpen } from "lucide-react";

export const Footer = () => {
  return (
    <div>
      <Separator />
      <div className="flex items-center justify-center gap-6 px-6 py-4 bg-muted text-sm text-muted-foreground">
        <Link to="/rules" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
          <BookOpen size={14} />
          How to Play
        </Link>
        <span>·</span>
        <a
          href="https://github.com/Jamie1729/articulate"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <FolderGit2 size={14} />
          Source
        </a>
        <span>·</span>
        <a
          href="https://github.com/Jamie1729"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <GithubIcon size={14} />
          GitHub
        </a>
        <span>·</span>
        <a
          href="https://www.linkedin.com/in/jamie-c-redman/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <LinkedInIcon size={14} />
          LinkedIn
        </a>
      </div>
    </div>
  );
};
