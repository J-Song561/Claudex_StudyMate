#!/usr/bin/env python
"""
Simple script to delete all ChatDocuments except the latest one.
Run with: python cleanup_old_docs.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Claudex.settings')
django.setup()

from main.models import ChatDocument

def cleanup():
    # Get all documents ordered by upload time (newest first)
    docs = ChatDocument.objects.all().order_by('-uploaded_at')
    total = docs.count()

    if total == 0:
        print("❌ No documents found in database.")
        return

    if total == 1:
        print(f"✅ Only 1 document exists: [{docs.first().id}] {docs.first().title}")
        print("Nothing to delete.")
        return

    # Show what will be deleted
    latest = docs.first()
    to_delete = docs.exclude(id=latest.id)

    print(f"\n📊 Total documents: {total}")
    print(f"\n✅ KEEPING (latest):")
    print(f"   [{latest.id}] {latest.title or 'Untitled'} - {latest.uploaded_at}")

    print(f"\n❌ DELETING ({to_delete.count()} documents):")
    for doc in to_delete:
        print(f"   [{doc.id}] {doc.title or 'Untitled'} - {doc.uploaded_at}")

    # Ask for confirmation
    response = input("\n⚠️  Proceed with deletion? (yes/no): ").strip().lower()

    if response == 'yes':
        deleted_count, _ = to_delete.delete()
        print(f"\n✅ Successfully deleted {deleted_count} documents!")
        print(f"✅ Kept: [{latest.id}] {latest.title or 'Untitled'}")
    else:
        print("\n❌ Cancelled. No documents were deleted.")

if __name__ == '__main__':
    cleanup()
