# Changelog

## 1.0.0 (2026-10-17)


### Features

* add public campaign data layer with injectable Supabase client ([9c2f0cc](https://github.com/design-sparx/crowdup/commit/9c2f0cc73717042b24e42321e6a48ce979849265))
* add terms, privacy and security pages ([e560970](https://github.com/design-sparx/crowdup/commit/e56097042b9a2812d5de973b4a86b9848bb1963e))
* admin approval mode with pending_approval and rejected statuses ([ad33d4d](https://github.com/design-sparx/crowdup/commit/ad33d4d3195cc99b26b7e916afe8a812ec0facc7))
* **admin:** moderation actions with audit trail ([0aa3a52](https://github.com/design-sparx/crowdup/commit/0aa3a5245a21d31bcbf84552fda397709fed6113))
* **admin:** review unmatched payments and prune old reviewed ones ([ccacdf0](https://github.com/design-sparx/crowdup/commit/ccacdf0306376736021caae20dd88fd067f843b4))
* adopt React Router framework mode in single-page mode ([a1b1f7a](https://github.com/design-sparx/crowdup/commit/a1b1f7a0499c695beb962add803a70960a99313f))
* **auth:** email/password and optional Google sign-in with Supabase Auth ([5f2cfdc](https://github.com/design-sparx/crowdup/commit/5f2cfdc35a713c3c6beb95b93735895dac90a122))
* **campaigns:** add slug, story sanitising/rendering, cover and form validation ([4946dad](https://github.com/design-sparx/crowdup/commit/4946dad5f1988cf50c21820f30b4c54cec50fbef))
* **campaigns:** create and edit campaign pages backed by owner data-access ([bbbd272](https://github.com/design-sparx/crowdup/commit/bbbd2722e9c9c08c7baff69f501b6660f9c1a0ed))
* **campaigns:** lifecycle rules, close action and organiser updates ([c4dff13](https://github.com/design-sparx/crowdup/commit/c4dff133ffce02fa5b4057224d7c580e1461612d))
* **dashboard:** organiser dashboard on real campaign and donation data ([209fbfc](https://github.com/design-sparx/crowdup/commit/209fbfc1f5fd099e3562a2597c45a464bfbd5208))
* **db:** add campaign-covers storage bucket, policies and permission tests ([59dc26c](https://github.com/design-sparx/crowdup/commit/59dc26c972cdfba1bcbf702259591442eb0b9022))
* **db:** add Supabase schema, RLS policies and seed data ([5a3561f](https://github.com/design-sparx/crowdup/commit/5a3561f49536415c25a48ee73d9ea534c590c8cc))
* **db:** donor_user_id and flagged_reason on donation ([47bb789](https://github.com/design-sparx/crowdup/commit/47bb789afbdfc95c45d5ad424100c09298d835ea))
* **demo:** DEMO_MODE banner with Stripe test-mode guard ([d20e7f5](https://github.com/design-sparx/crowdup/commit/d20e7f5d557f8e64ff861472e6e1b791e94bad7a))
* **demo:** guarded scheduled reset and demo-only seed accounts ([e2b95ad](https://github.com/design-sparx/crowdup/commit/e2b95ad392cc99f4e70230981695ac9fd5e79a2a))
* **donations:** fee, amount, donor and metadata rules with tests ([40ad23c](https://github.com/design-sparx/crowdup/commit/40ad23cf811e7c92b102a17453bf9c1a674a3342))
* **donations:** Stripe direct-charge checkout, donation webhook, donor list and form ([e9e7d57](https://github.com/design-sparx/crowdup/commit/e9e7d571e55a2b38a257f0223e863975bb078f08))
* donor donation history page with my_donation view (unverified: no DB run) ([68526c0](https://github.com/design-sparx/crowdup/commit/68526c0770cda866e511dc2d967816d4f5cb9b5a))
* enable server rendering with per-route meta ([d8513de](https://github.com/design-sparx/crowdup/commit/d8513deeb234483cbd1b89d048759b880c46aabe))
* **helpers:** add formatAmount currency helper with tests ([9dc95ae](https://github.com/design-sparx/crowdup/commit/9dc95aea9375c91141d417c7cfb0d5ca79f0f837))
* **reports:** rate limiter and report helpers with unit tests ([1bafa0e](https://github.com/design-sparx/crowdup/commit/1bafa0e2b8857520fa999bdc9ebac0b944ed2fa9))
* **reports:** report form on campaigns and admin report queue ([78ce00f](https://github.com/design-sparx/crowdup/commit/78ce00f4ea4712f909f9aa59b05024ddfc74d621))
* serve home, campaign list and details from Supabase with share meta ([dacb650](https://github.com/design-sparx/crowdup/commit/dacb650f91781660795aa7e0ac45843e88f4561d))
* **stripe:** connect onboarding, automatic go-live and currency from the Stripe account ([fec8b88](https://github.com/design-sparx/crowdup/commit/fec8b888e46dea97f43916bf736ab174b35618fa))


### Bug Fixes

* **campaigns:** apply a live edit only if the campaign is unchanged since it was read ([6371f0c](https://github.com/design-sparx/crowdup/commit/6371f0c290cb463c1163699a28b40b17cf9cf373))
* **campaigns:** apply an edit only if the status is unchanged since it was read ([d958001](https://github.com/design-sparx/crowdup/commit/d9580015787d72551755d94276d5a3b9cf79259f))
* **campaigns:** keep the goal of a reopened rejected campaign when it goes live again ([3e43cef](https://github.com/design-sparx/crowdup/commit/3e43cef8e0dd40aa1e340a657cfa70430fb824f8))
* **campaigns:** refuse go-live when the goal cannot be expressed in the account currency ([ec7d5e0](https://github.com/design-sparx/crowdup/commit/ec7d5e07d98cf72b513116e290054da6a8514049))
* **campaigns:** reopen a rejected campaign in the same update as its edit ([38dec9b](https://github.com/design-sparx/crowdup/commit/38dec9b1ddeca71d638adf4c1a8fb078cfec374d))
* **campaigns:** send edited live content back to review in approval mode ([abb0ee0](https://github.com/design-sparx/crowdup/commit/abb0ee046e40d9daf339a99e936989e8137f0d2d))
* **campaigns:** use the currency's minor-unit exponent for goals and amounts ([503624a](https://github.com/design-sparx/crowdup/commit/503624ab2d04a6bef8793d1feeac469fd4a97647))
* **db:** drop unneeded service_role select grant on my_donation ([6779c92](https://github.com/design-sparx/crowdup/commit/6779c92d0cc3d64396f4d7225eaea4433851e3d2))
* **donations:** cap amounts at Stripe's 8-digit maximum for 3-decimal currencies ([820c0f5](https://github.com/design-sparx/crowdup/commit/820c0f5af8d091be5ddc374accf897cccbaa71ec))
* **donations:** record paid sessions that match no campaign instead of dropping them ([69d6ce0](https://github.com/design-sparx/crowdup/commit/69d6ce0de22c3f11d6f766f80f6e6264a7b53e3d))
* **donations:** record unmatched payments with a missing currency instead of failing the webhook ([9d0b10d](https://github.com/design-sparx/crowdup/commit/9d0b10deb6a0db73763729f404c8e9a3064abe0c))
* layout regressions from Mantine 9 upgrade ([dadc267](https://github.com/design-sparx/crowdup/commit/dadc267300a2c7c58408fa8944ddf04d701c43ed))
* **moderation:** only live or closed campaigns can be suspended, in SQL and TypeScript ([1c971df](https://github.com/design-sparx/crowdup/commit/1c971df856f0f132d2995d106c4b6d96d259566f))
* **moderation:** raise approval refusals with their own SQLSTATE ([eff42db](https://github.com/design-sparx/crowdup/commit/eff42db49d435ae494b38c462c94ed99c88b50cb))
* **moderation:** refuse approval when the organiser cannot take donations ([319fda9](https://github.com/design-sparx/crowdup/commit/319fda9b1e3b85cf69a5f31a86db20fe5d8ac665))
* **reports:** cap lookups separately so unknown slugs cannot hammer the database ([b05d38b](https://github.com/design-sparx/crowdup/commit/b05d38b529e490b4ccee81cd3214e2c641eb81d7))
* **reports:** key guest rate limit on the trusted client IP and spend it after the campaign lookup ([739f08d](https://github.com/design-sparx/crowdup/commit/739f08d6536fafac0a215ce171fc40db3f022f3e))
* **reports:** trust only an operator-configured client IP header for the rate limit ([d66403d](https://github.com/design-sparx/crowdup/commit/d66403d371a8cabbc6777b6672093d421bbad665))
