CREATE POLICY "Users can insert own positions." ON public.positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions." ON public.positions FOR UPDATE USING (auth.uid() = user_id);
