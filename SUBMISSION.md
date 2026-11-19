# SECOND SUN

Patriot HackFest Fall 2026 · Life Underground

Seshank Mallireddigari

In the Hollow, an underground settlement with no sunlight, residents share bright-light rooms around their shifts. When geothermal power is rationed, the order in which crews get booked determines who still has access. SECOND SUN lets an operator compare those choices and turn one into tomorrow’s room schedule.

The app runs three policies against the same room capacities, shift windows, access rules and electricity limits. The fictional Directorate serves upper levels first. First-come fills requests in entry order. SECOND SUN gives the next feasible slot to the crew with the lowest share of its request filled. In the opening simulation, the Directorate books six of 18 requested sessions and gives the two deepest crews zero. SECOND SUN books eight and gives every requesting crew some room time. Both outcomes come from the same TypeScript scheduler.

An operator can take rooms offline or simulate a generator failure, see which crews lose time, and export the recalculated schedule as a printable run sheet, CSV, JSON or a shift handover. The scheduling pattern could also help plan access to shared facilities with limited power, such as remote worksites. This prototype uses a fixed fictional scenario and a greedy heuristic. Preferred times are planning assumptions. Emergency, exit and essential task lighting are outside the allocation.

- [Source on GitHub](https://github.com/PlutonicSauce/second-sun)
- [Existing public demo URL](https://second-sun-rho.vercel.app)
- [75-second recording script](./DEMO_SCRIPT.md)

## Before submitting

1. Confirm the portal, deadline and required fields with the organizer. The team handoff lists Friday, November 20, 2026 at 11:00 PM Eastern.
2. Review the final-review branch. After approval, publish the reviewed revision through the existing deployment and verify the public URL from a judge’s browser.
3. Record the demo, then submit the description, demo link, video and source link in the verified portal.
