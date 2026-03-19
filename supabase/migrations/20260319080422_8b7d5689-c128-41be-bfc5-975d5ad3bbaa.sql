-- Allow public (anon) access to all tables since auth was removed
CREATE POLICY "Public can view exams" ON public.exams FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view exam_halls" ON public.exam_halls FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view user_roles" ON public.user_roles FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view duty_assignments" ON public.duty_assignments FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view conflicts" ON public.conflicts FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view nlp_requests" ON public.nlp_requests FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view notifications" ON public.notifications FOR SELECT TO anon USING (true);
CREATE POLICY "Public can manage exams" ON public.exams FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage duty_assignments" ON public.duty_assignments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage conflicts" ON public.conflicts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage nlp_requests" ON public.nlp_requests FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage notifications" ON public.notifications FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage profiles" ON public.profiles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage user_roles" ON public.user_roles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage exam_halls" ON public.exam_halls FOR ALL TO anon USING (true) WITH CHECK (true);