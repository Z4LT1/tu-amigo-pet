"use client";

import { useActionState } from "react";
import type { Product } from "@prisma/client";
import { saveProduct, type ProductFormState } from "@/server/admin";
import { PackShot } from "@/components/product/PackShot";
import { ImageUploader } from "./ImageUploader";
import styles from "@/app/admin/admin.module.css";

type Option = { id: string; name: string; icon?: string | null };

export function ProductForm({ product, categories, brands }: { product?: Product; categories: Option[]; brands: Option[] }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct.bind(null, product?.id ?? null), {});
  const e = state.errors ?? {};
  const err = (k: string) => e[k] && <p className="field-error">{e[k]}</p>;

  return (
    <form action={action} className={styles.form}>
      {state.saved && <p className="form-alert form-alert--ok">Cambios guardados. La tienda ya muestra la información actualizada.</p>}
      {Object.keys(e).length > 0 && <p className="form-alert">Revisa los campos marcados.</p>}

      <section className={styles.panel}>
        <h2>Información</h2>
        <div className={styles.grid2}>
          <div className={`field ${styles.span2}`}>
            <label htmlFor="name">Nombre</label>
            <input id="name" name="name" className="input" defaultValue={product?.name} aria-invalid={!!e.name} required />
            {err("name")}
          </div>
          <div className="field">
            <label htmlFor="sku">SKU</label>
            <input id="sku" name="sku" className="input" defaultValue={product?.sku} aria-invalid={!!e.sku} required />
            {err("sku")}
          </div>
          <div className="field">
            <label htmlFor="presentation">Presentación</label>
            <input id="presentation" name="presentation" className="input" placeholder="Ej: 15 kg, 12 x 85 g" defaultValue={product?.presentation} required />
            {err("presentation")}
          </div>
          <div className="field">
            <label htmlFor="categoryId">Categoría</label>
            <select id="categoryId" name="categoryId" className="select" defaultValue={product?.categoryId}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="brandId">Marca</label>
            <select id="brandId" name="brandId" className="select" defaultValue={product?.brandId}>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="species">Para</label>
            <select id="species" name="species" className="select" defaultValue={product?.species ?? "PERRO"}>
              <option value="PERRO">Perro</option>
              <option value="GATO">Gato</option>
              <option value="AMBOS">Perro y gato</option>
              <option value="OTROS">Otras mascotas</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="lifeStage">Etapa de vida</label>
            <select id="lifeStage" name="lifeStage" className="select" defaultValue={product?.lifeStage ?? "TODAS"}>
              <option value="TODAS">Todas</option>
              <option value="CACHORRO">Cachorro / gatito</option>
              <option value="ADULTO">Adulto</option>
              <option value="SENIOR">Senior</option>
            </select>
          </div>
          <div className={`field ${styles.span2}`}>
            <label htmlFor="shortDescription">Descripción corta (se ve en la ficha y en Google)</label>
            <input id="shortDescription" name="shortDescription" className="input" defaultValue={product?.shortDescription} aria-invalid={!!e.shortDescription} required />
            {err("shortDescription")}
          </div>
          <div className={`field ${styles.span2}`}>
            <label htmlFor="description">Descripción completa</label>
            <textarea id="description" name="description" className="textarea" rows={5} defaultValue={product?.description} aria-invalid={!!e.description} required />
            {err("description")}
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Precio e inventario</h2>
        <div className={styles.grid3}>
          <div className="field">
            <label htmlFor="price">Precio de venta (CLP, IVA incl.)</label>
            <input id="price" name="price" type="number" min={0} className="input" defaultValue={product?.price} aria-invalid={!!e.price} required />
            {err("price")}
          </div>
          <div className="field">
            <label htmlFor="compareAtPrice">Precio anterior (para oferta)</label>
            <input id="compareAtPrice" name="compareAtPrice" type="number" min={0} className="input" defaultValue={product?.compareAtPrice ?? ""} aria-invalid={!!e.compareAtPrice} />
            {err("compareAtPrice")}
          </div>
          <div className="field">
            <label htmlFor="cost">Costo (uso interno)</label>
            <input id="cost" name="cost" type="number" min={0} className="input" defaultValue={product?.cost ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="minStock">Stock mínimo (alerta)</label>
            <input id="minStock" name="minStock" type="number" min={0} className="input" defaultValue={product?.minStock ?? 5} required />
          </div>
          {!product && (
            <div className="field">
              <label htmlFor="initialStock">Stock inicial</label>
              <input id="initialStock" name="initialStock" type="number" min={0} className="input" defaultValue={0} />
            </div>
          )}
        </div>
        {product && <p className="muted">El stock se modifica con movimientos de inventario, para que quede registro de cada cambio.</p>}
      </section>

      <section className={styles.panel}>
        <h2>Foto</h2>
        <ImageUploader
          initialUrl={product?.imageUrl}
          fallback={
            <PackShot
              brand={brands.find((b) => b.id === product?.brandId)?.name ?? "Tu marca"}
              color={product?.packColor ?? "#2a5da8"}
              icon={categories.find((c) => c.id === product?.categoryId)?.icon}
              presentation={product?.presentation}
            />
          }
        />
        {err("imageUrl")}
      </section>

      <section className={styles.panel}>
        <h2>Visibilidad</h2>
        <div className={styles.grid2}>
          <div className={styles.checks}>
            <label className="check">
              <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} /> Visible en la tienda
            </label>
            <label className="check">
              <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} /> Destacado en el inicio
            </label>
            <label className="check">
              <input type="checkbox" name="requiresPrescription" defaultChecked={product?.requiresPrescription} /> Requiere receta (solo venta en local)
            </label>
          </div>
          <div className="field">
            <label htmlFor="packColor">Color del envase ilustrado (se usa si no hay foto)</label>
            <input id="packColor" name="packColor" type="color" className={`input ${styles.color}`} defaultValue={product?.packColor ?? "#2a5da8"} />
          </div>
        </div>
      </section>

      <div className={styles.formActions}>
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
