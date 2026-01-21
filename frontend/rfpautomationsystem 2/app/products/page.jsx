"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Plus,
  Upload,
  Package,
  Filter,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Lock,
  User,
  AlertCircle,
  Loader2,
  Shield,
  Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Power Cables", "Control Cables", "Safety Cables", "Instrumentation Cables"];

const PRODUCTS_STORAGE_KEY = "rfp_products_db";

// Default products with owner IDs
const defaultProducts = [
  {
    id: "SKU-001",
    name: "HV Power Cable 3C x 120mm",
    category: "Power Cables",
    specifications: {
      voltage: "11 kV",
      conductor: "Copper",
      insulation: "XLPE",
      armoring: "Steel Wire",
    },
    price: 850,
    unit: "per meter",
    ownerId: "user-1",
    ownerName: "John Smith",
  },
  {
    id: "SKU-002",
    name: "Control Cable 12C x 2.5mm",
    category: "Control Cables",
    specifications: {
      cores: 12,
      conductor: "Copper",
      insulation: "PVC",
      shielding: "Braided",
    },
    price: 320,
    unit: "per meter",
    ownerId: "user-2",
    ownerName: "Jane Doe",
  },
  {
    id: "SKU-003",
    name: "Fire Resistant Cable 4C x 16mm",
    category: "Safety Cables",
    specifications: {
      rating: "FR",
      conductor: "Copper",
      insulation: "LSZH",
      temperature: "90C",
    },
    price: 480,
    unit: "per meter",
    ownerId: "user-1",
    ownerName: "John Smith",
  },
  {
    id: "SKU-004",
    name: "Instrumentation Cable 2P x 1.5",
    category: "Instrumentation Cables",
    specifications: {
      pairs: 2,
      conductor: "Copper",
      insulation: "PE",
      shielding: "Individual + Overall",
    },
    price: 280,
    unit: "per meter",
    ownerId: "user-3",
    ownerName: "Mike Johnson",
  },
  {
    id: "SKU-005",
    name: "HT Power Cable 11kV 3C x 95",
    category: "Power Cables",
    specifications: {
      voltage: "11 kV",
      conductor: "Aluminum",
      insulation: "XLPE",
      armoring: "Double Steel Tape",
    },
    price: 1250,
    unit: "per meter",
    ownerId: "user-2",
    ownerName: "Jane Doe",
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, canEdit, canDelete, canCreate } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewFilter, setViewFilter] = useState("all"); // all, mine
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New product form state
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    unit: "per meter",
    specifications: "",
  });

  // Load products from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(defaultProducts));
        setProducts(defaultProducts);
      }
    }
  }, []);

  // Save products to localStorage whenever they change
  const saveProducts = useCallback((newProducts) => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
    setProducts(newProducts);
  }, []);

  // Check if current user owns a product
  const isOwner = (product) => {
    return user && product.ownerId === user.id;
  };

  // Check if user can modify a product
  const canModify = (product) => {
    if (!isAuthenticated) return false;
    return canEdit(product.ownerId);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesView =
      viewFilter === "all" || (viewFilter === "mine" && isOwner(product));
    return matchesSearch && matchesCategory && matchesView;
  });

  // Count user's products
  const myProductsCount = products.filter((p) => isOwner(p)).length;

  // Handle add product
  const handleAddProduct = async () => {
    if (!isAuthenticated) {
      setError("You must be logged in to add products");
      return;
    }

    if (!canCreate()) {
      setError("You do not have permission to create products");
      return;
    }

    if (!newProduct.sku || !newProduct.name || !newProduct.category || !newProduct.price) {
      setError("Please fill in all required fields");
      return;
    }

    // Check if SKU already exists
    if (products.some((p) => p.id === newProduct.sku)) {
      setError("A product with this SKU already exists");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      let specs = {};
      if (newProduct.specifications) {
        try {
          specs = JSON.parse(newProduct.specifications);
        } catch {
          const lines = newProduct.specifications.split("\n");
          for (const line of lines) {
            const [key, value] = line.split(":").map((s) => s.trim());
            if (key && value) {
              specs[key] = value;
            }
          }
        }
      }

      const product = {
        id: newProduct.sku,
        name: newProduct.name,
        category: newProduct.category,
        price: Number.parseFloat(newProduct.price),
        unit: newProduct.unit,
        specifications: specs,
        ownerId: user.id,
        ownerName: user.name,
      };

      const newProducts = [...products, product];
      saveProducts(newProducts);
      setIsAddDialogOpen(false);
      setNewProduct({
        sku: "",
        name: "",
        category: "",
        price: "",
        unit: "per meter",
        specifications: "",
      });
      setSuccess("Product added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit product
  const handleEditProduct = async () => {
    if (!editProduct) return;

    if (!canModify(editProduct)) {
      setError("You can only edit your own products");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newProducts = products.map((p) =>
        p.id === editProduct.id ? editProduct : p
      );
      saveProducts(newProducts);
      setIsEditDialogOpen(false);
      setEditProduct(null);
      setSuccess("Product updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;

    if (!canDelete(deleteProduct.ownerId)) {
      setError("You can only delete your own products");
      setDeleteProduct(null);
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newProducts = products.filter((p) => p.id !== deleteProduct.id);
      saveProducts(newProducts);
      setDeleteProduct(null);
      setSuccess("Product deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (product) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!canModify(product)) {
      setError("You can only edit your own products");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setEditProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (product) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!canDelete(product.ownerId)) {
      setError("You can only delete your own products");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setDeleteProduct(product);
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Product Catalog"
            subtitle="Manage your product SKUs and specifications"
          />

          <main className="flex-1 overflow-y-auto p-6">
          {/* Auth Warning */}
          {!isAuthenticated && (
            <Alert className="mb-6 bg-warning/10 border-warning/30">
              <Lock className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                You are viewing as a guest.{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="font-medium underline"
                >
                  Sign in
                </button>{" "}
                to add, edit, or delete your products.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 bg-success/10 border-success/30">
              <AlertDescription className="text-success">{success}</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setError("")}
              >
                Dismiss
              </Button>
            </Alert>
          )}

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by SKU or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 bg-secondary/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isAuthenticated && (
                <Select value={viewFilter} onValueChange={setViewFilter}>
                  <SelectTrigger className="w-40 bg-secondary/50">
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="mine">My Products</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!isAuthenticated || !canCreate()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Enter product details. This product will be owned by you and only you can edit or delete it.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sku">SKU ID *</Label>
                        <Input
                          id="sku"
                          placeholder="SKU-XXX"
                          value={newProduct.sku}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, sku: e.target.value }))
                          }
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(value) =>
                            setNewProduct((prev) => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        placeholder="Product name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Unit Price (INR) *</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, price: e.target.value }))
                          }
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          placeholder="per meter"
                          value={newProduct.unit}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, unit: e.target.value }))
                          }
                          className="bg-secondary/50"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="specifications">
                        Specifications (key: value per line)
                      </Label>
                      <Textarea
                        id="specifications"
                        placeholder={"voltage: 11 kV\nconductor: Copper\ninsulation: XLPE"}
                        rows={4}
                        value={newProduct.specifications}
                        onChange={(e) =>
                          setNewProduct((prev) => ({
                            ...prev,
                            specifications: e.target.value,
                          }))
                        }
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddProduct} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Product"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-info/10">
                    <FileSpreadsheet className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {isAuthenticated && (
              <>
                <Card className="card-hover border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-success/10">
                        <User className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">My Products</p>
                        <p className="text-2xl font-bold text-foreground">{myProductsCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-warning/10">
                        {user?.role === "admin" ? (
                          <Crown className="w-5 h-5 text-warning" />
                        ) : (
                          <Shield className="w-5 h-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Your Role</p>
                        <p className="text-lg font-bold text-foreground capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`card-hover ${
                  isOwner(product) ? "ring-1 ring-primary/40 border-primary/30" : ""
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-mono text-primary font-medium mb-1">
                        {product.id}
                      </p>
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                    </div>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>

                  {/* Owner info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <User className="w-3 h-3" />
                    <span>{isOwner(product) ? "You" : product.ownerName}</span>
                    {isOwner(product) && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                        Owner
                      </Badge>
                    )}
                    {user?.role === "admin" && !isOwner(product) && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning border-warning/30">
                        Admin Access
                      </Badge>
                    )}
                  </div>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-muted-foreground capitalize">{key}: </span>
                        <span className="text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        Rs {product.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.unit}</p>
                    </div>
                    {canModify(product) && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteConfirm(product)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {viewFilter === "mine"
                  ? "You haven't added any products yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {isAuthenticated && viewFilter === "mine" && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below.
            </DialogDescription>
          </DialogHeader>
          {editProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>SKU ID</Label>
                <Input value={editProduct.id} disabled className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-secondary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Unit Price (INR)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        price: Number.parseFloat(e.target.value),
                      }))
                    }
                    className="bg-secondary/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editProduct.category}
                    onValueChange={(value) =>
                      setEditProduct((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button onClick={handleEditProduct} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RequireAuth>
  );
}
