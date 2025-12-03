import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  branch: z.string().min(1, "Please select a branch"),
  division: z.string().min(1, "Please select a division"),
});

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const branches = [
    "Computer Engineering",
    "Information Technology Engineering",
    "Electronics and Telecommunication",
    "Mechanical Engineering",
    "Automation and Robotics Engineering"
  ];

  const divisions = ["A", "B"];

  const validateForm = (name: string, email: string, password: string, branch: string, division: string) => {
    try {
      signUpSchema.parse({ name, email, password, branch, division });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const branch = formData.get("branch") as string;
    const division = formData.get("division") as string;

    if (!validateForm(name, email, password, branch, division)) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          branch,
          division,
        }),
      });

      if (res.ok) {
        toast({
          variant: "success",
          title: "Success",
          description: "Account created successfully",
        });

        // Sign in automatically after successful registration
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!signInRes?.error) {
          router.push("/home");
          router.refresh();
        }
      } else {
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          name="name"
          placeholder="Name"
          required
          className={`w-full ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          className={`w-full ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
        )}
      </div>
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          className={`w-full ${errors.password ? 'border-red-500' : ''}`}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Password must be at least 8 characters and contain uppercase, lowercase, and numbers
        </p>
      </div>
      <div>
        <select
          name="branch"
          required
          className={`w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.branch ? 'border-red-500' : ''}`}
          defaultValue=""
        >
          <option value="" disabled>Select Branch</option>
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
        {errors.branch && (
          <p className="text-sm text-red-500 mt-1">{errors.branch}</p>
        )}
      </div>
      <div>
        <select
          name="division"
          required
          className={`w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.division ? 'border-red-500' : ''}`}
          defaultValue=""
        >
          <option value="" disabled>Select Division</option>
          {divisions.map((division) => (
            <option key={division} value={division}>
              Division {division}
            </option>
          ))}
        </select>
        {errors.division && (
          <p className="text-sm text-red-500 mt-1">{errors.division}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}