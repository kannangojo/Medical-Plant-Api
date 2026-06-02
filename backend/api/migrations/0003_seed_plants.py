from django.db import migrations


PLANTS = [
    {
        'name': 'Neem',
        'botanical_name': 'Azadirachta indica',
        'family': 'Meliaceae',
        'uses': [
            'Traditionally used for skin care and minor skin irritation.',
            'Leaves are used in many home remedies for oral hygiene.',
            'Neem oil is used externally for scalp and skin support.',
            'Acts as a natural insect repellent in gardens.',
        ],
        'parts_used': ['Leaves', 'Bark', 'Seeds', 'Oil'],
        'preparation': 'Common forms include leaf paste, boiled leaf water, neem oil, and dried leaf powder.',
        'caution': 'Neem should not be swallowed in large amounts. Avoid neem oil during pregnancy and keep it away from children.',
    },
    {
        'name': 'Tulsi',
        'botanical_name': 'Ocimum tenuiflorum',
        'family': 'Lamiaceae',
        'uses': [
            'Often used in herbal tea for cough and cold comfort.',
            'Supports general wellness in traditional medicine.',
            'Leaves are used for mild stress and respiratory support.',
        ],
        'parts_used': ['Leaves', 'Flowers'],
        'preparation': 'Usually prepared as tea, fresh leaf juice, or a simple decoction.',
        'caution': 'People taking blood-thinning medicine should ask a doctor before frequent use.',
    },
    {
        'name': 'Aloe Vera',
        'botanical_name': 'Aloe barbadensis miller',
        'family': 'Asphodelaceae',
        'uses': [
            'Gel is used externally for minor burns and dry skin.',
            'Common ingredient in skin and hair care products.',
            'Traditionally used for soothing irritated skin.',
        ],
        'parts_used': ['Leaf gel'],
        'preparation': 'Fresh inner leaf gel is applied externally after cleaning the leaf.',
        'caution': 'Avoid applying to deep wounds. Oral use can cause stomach upset and should be medically supervised.',
    },
    {
        'name': 'Turmeric',
        'botanical_name': 'Curcuma longa',
        'family': 'Zingiberaceae',
        'uses': [
            'Used traditionally for inflammation support.',
            'Commonly used in food and herbal drinks.',
            'Applied in some cultures as a skin paste.',
        ],
        'parts_used': ['Rhizome'],
        'preparation': 'Used as dried powder, fresh rhizome, paste, or turmeric milk.',
        'caution': 'High amounts may not suit people with gallbladder issues or those taking blood thinners.',
    },
    {
        'name': 'Mint',
        'botanical_name': 'Mentha',
        'family': 'Lamiaceae',
        'uses': [
            'Used for digestion comfort.',
            'Leaves are used in tea for freshness and mild nausea.',
            'Commonly used in food, drinks, and oral care.',
        ],
        'parts_used': ['Leaves'],
        'preparation': 'Prepared as fresh leaf tea, chutney, infused water, or essential oil products.',
        'caution': 'Peppermint oil should be diluted and may worsen reflux in some people.',
    },
]


def seed_plants(apps, schema_editor):
    Plant = apps.get_model('api', 'Plant')
    for plant in PLANTS:
        Plant.objects.get_or_create(name=plant['name'], defaults=plant)


def remove_seeded_plants(apps, schema_editor):
    Plant = apps.get_model('api', 'Plant')
    Plant.objects.filter(name__in=[plant['name'] for plant in PLANTS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0002_plant'),
    ]

    operations = [
        migrations.RunPython(seed_plants, remove_seeded_plants),
    ]
