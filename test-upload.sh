#!/bin/bash

# Test CSV upload via curl
curl -X POST https://www.menshb.com/api/admin/import/upload \
  -F "file=@public/test-import.csv" \
  -H "Accept: application/json" \
  -v 