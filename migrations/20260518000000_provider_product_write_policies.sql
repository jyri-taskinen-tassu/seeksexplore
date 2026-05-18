-- Allow providers to INSERT/UPDATE their own products and child rows

-- products: INSERT
CREATE POLICY "provider_insert_products"
ON seeks_and_explore_demo.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM seeks_and_explore_demo.provider_users pu
    WHERE pu.provider_id = products.provider_id
      AND pu.profile_id = auth.uid()
  )
);

-- products: UPDATE
CREATE POLICY "provider_update_products"
ON seeks_and_explore_demo.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM seeks_and_explore_demo.provider_users pu
    WHERE pu.provider_id = products.provider_id
      AND pu.profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM seeks_and_explore_demo.provider_users pu
    WHERE pu.provider_id = products.provider_id
      AND pu.profile_id = auth.uid()
  )
);

-- product_information: INSERT
CREATE POLICY "provider_insert_product_information"
ON seeks_and_explore_demo.product_information
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM seeks_and_explore_demo.products p
    JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
    WHERE p.id = product_information.product_id
      AND pu.profile_id = auth.uid()
  )
);

-- product_information: UPDATE
CREATE POLICY "provider_update_product_information"
ON seeks_and_explore_demo.product_information
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM seeks_and_explore_demo.products p
    JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
    WHERE p.id = product_information.product_id
      AND pu.profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM seeks_and_explore_demo.products p
    JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
    WHERE p.id = product_information.product_id
      AND pu.profile_id = auth.uid()
  )
);

-- product_tags: INSERT
CREATE POLICY "provider_insert_product_tags"
ON seeks_and_explore_demo.product_tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM seeks_and_explore_demo.products p
    JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
    WHERE p.id = product_tags.product_id
      AND pu.profile_id = auth.uid()
  )
);

-- product_tags: DELETE (needed for tag sync: delete-all then re-insert)
CREATE POLICY "provider_delete_product_tags"
ON seeks_and_explore_demo.product_tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM seeks_and_explore_demo.products p
    JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
    WHERE p.id = product_tags.product_id
      AND pu.profile_id = auth.uid()
  )
);
