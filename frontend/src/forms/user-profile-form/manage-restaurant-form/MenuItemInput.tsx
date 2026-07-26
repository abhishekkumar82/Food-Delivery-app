import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import {
  FOOD_TYPES,
  SPICE_LEVELS,
  MENU_CATEGORIES,
} from "@/config/menu-options-config";

// import React from 'react'
type Props = {
  index: number;
  removeMenuItem: () => void;
};

const MenuItemInput = ({ index, removeMenuItem }: Props) => {
  const { control, register } = useFormContext();

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-white p-4">
      <div className="flex flex-row items-end gap-2">
        <FormField
          control={control}
          name={`menuItems.${index}.name`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="flex items-center gap-1">Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Cheese Pizza" className="bg-white" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`menuItems.${index}.price`}
          render={({ field }) => (
            <FormItem className="w-28">
              <FormLabel className="flex items-center gap-1">Price ($)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="8.00" className="bg-white" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="button"
          onClick={removeMenuItem}
          className="bg-red-500 max-h-fit"
        >
          Remove
        </Button>
      </div>

      {/* ---- Tier 1: richer menu-item fields ---- */}
      <FormField
        control={control}
        name={`menuItems.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Wood-fired, fresh mozzarella, basil"
                className="bg-white"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="flex flex-wrap items-end gap-3">
        {/* Category */}
        <FormItem className="flex flex-col">
          <FormLabel>Category</FormLabel>
          <select
            {...register(`menuItems.${index}.category`)}
            className="h-10 rounded-md border bg-white px-2 text-sm"
          >
            {MENU_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormItem>

        {/* Food type */}
        <FormItem className="flex flex-col">
          <FormLabel>Food type</FormLabel>
          <select
            {...register(`menuItems.${index}.foodType`)}
            className="h-10 rounded-md border bg-white px-2 text-sm"
          >
            {FOOD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </FormItem>

        {/* Spice level */}
        <FormItem className="flex flex-col">
          <FormLabel>Spice</FormLabel>
          <select
            {...register(`menuItems.${index}.spiceLevel`)}
            className="h-10 rounded-md border bg-white px-2 text-sm"
          >
            {SPICE_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </FormItem>

        {/* Bestseller */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register(`menuItems.${index}.isBestseller`)}
          />
          Bestseller
        </label>

        {/* In stock */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked
            {...register(`menuItems.${index}.inStock`)}
          />
          In stock
        </label>
      </div>
    </div>
  );
};

export default MenuItemInput;
